import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader, Camera, Upload, X, CheckCircle } from 'lucide-react';
import { getMagazineById, createMagazine, updateMagazine, type Magazine, type InsertMagazine, type UpdateMagazine } from '../lib/magazines';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { performOCR, extractKeywords } from '../lib/ocr';

export function MagazineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.email === 'cynemos@gmail.com';
  const isNew = id === 'new';

  const [magazine, setMagazine] = useState<Magazine | InsertMagazine>({
    title: '',
    issue_number: '',
    publication_date: null,
    price: null,
    description: null,
    cover_image_url: null,
    keywords: null,
    has_plan: false,
    plan_model_name: null,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (!isNew && id) {
      loadMagazine();
    }
  }, [id, isAdmin, navigate, isNew]);

  const loadMagazine = async () => {
    if (!id) return;
    
    try {
      const data = await getMagazineById(id);
      if (!data) {
        throw new Error('Magazine introuvable');
      }
      setMagazine(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement du magazine');
      console.error('Error loading magazine:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `magazine-covers/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('magazines')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('magazines')
        .getPublicUrl(filePath);

      setMagazine(prev => ({
        ...prev,
        cover_image_url: publicUrl,
      }));

      try {
        setLoading(true);
        const text = await performOCR(publicUrl);
        const keywords = extractKeywords(text);
        
        setMagazine(prev => ({
          ...prev,
          keywords: keywords,
        }));
        
        setSuccess('Texte extrait avec succès de la couverture');
        setTimeout(() => setSuccess(null), 3000);
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        setError('L\'extraction du texte a échoué, mais l\'image a été téléchargée');
      } finally {
        setLoading(false);
      }

      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du téléchargement de l\'image');
    }
  };

  const startCamera = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        
        setShowCamera(true);
      } catch (err) {
        console.error('Camera error:', err);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
          
          setShowCamera(true);
        } catch (fallbackErr) {
          setError('Impossible d\'accéder à la caméra');
        }
      }
    }
  };

  const handleCameraFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        await handleFileUpload(file);
        stopCamera();
      }
    }, 'image/jpeg');
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        await createMagazine(magazine as InsertMagazine);
      } else if (id) {
        await updateMagazine(id, magazine as UpdateMagazine);
      }
      navigate('/magazines');
    } catch (err) {
      console.error('Error saving magazine:', err);
      setError(err instanceof Error ? err.message : 'Échec de l\'enregistrement du magazine');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setMagazine(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isNew ? 'Ajouter un Magazine' : 'Modifier le Magazine'}
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={magazine.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="issue_number" className="block text-sm font-medium text-gray-700">
              Numéro
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="issue_number"
                id="issue_number"
                required
                value={magazine.issue_number}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700">
              Date de publication
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="publication_date"
                id="publication_date"
                value={magazine.publication_date || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Prix
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="price"
                id="price"
                step="0.01"
                value={magazine.price || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                name="description"
                id="description"
                rows={3}
                value={magazine.description || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="has_plan"
                id="has_plan"
                checked={magazine.has_plan}
                onChange={(e) => setMagazine(prev => ({ ...prev, has_plan: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="has_plan" className="ml-2 block text-sm font-medium text-gray-700">
                Plan encarté
              </label>
            </div>
          </div>

          {magazine.has_plan && (
            <div className="sm:col-span-4">
              <label htmlFor="plan_model_name" className="block text-sm font-medium text-gray-700">
                Nom du modèle
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="plan_model_name"
                  id="plan_model_name"
                  value={magazine.plan_model_name || ''}
                  onChange={handleChange}
                  placeholder="Ex: Piper Cub J3"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Image de couverture
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                {magazine.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={magazine.cover_image_url}
                      alt="Couverture"
                      className="mx-auto h-32 w-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setMagazine(prev => ({ ...prev, cover_image_url: null }))}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <span className="sr-only">Supprimer</span>
                      ×
                    </button>
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Télécharger un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleCameraFileSelect}
                />
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Utiliser la caméra
                </button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </div>
            </div>

            {magazine.keywords && magazine.keywords.length > 0 && (
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Mots-clés extraits
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {magazine.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {showCamera && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-75">
            <div className="flex flex-col h-full">
              <div className="relative flex-1">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-white rounded-full shadow-lg text-gray-800 hover:bg-gray-100"
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-red-500 rounded-full shadow-lg text-white hover:bg-red-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
