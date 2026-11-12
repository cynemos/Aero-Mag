import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, CheckCircle, Loader, Plus, Save, ScanText, Upload, X, XCircle } from 'lucide-react';
import {
  createMagazine, emptyMagazine, getMagazineById, removeCoverByUrl, updateMagazine, uploadCover,
  type MagazineInput,
} from '../lib/magazines';
import { extractKeywords, performOCR } from '../lib/ocr';
import { processImage } from '../lib/imageProcessing';

const champ = 'mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2';

export function MagazineEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [magazine, setMagazine] = useState<MagazineInput>(emptyMagazine);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // traitement de l'image en cours
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // Couverture enregistrée en base au chargement, et couvertures envoyées pendant cette saisie :
  // on supprime du stockage celles qui ne servent plus, une fois la fiche enregistrée.
  const savedCover = useRef<string | null>(null);
  const uploadedCovers = useRef<string[]>([]);

  useEffect(() => {
    if (isNew || !id) return;
    getMagazineById(id)
      .then(data => {
        setMagazine(data);
        savedCover.current = data.cover_image_url;
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement de la revue'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      setBusy("Réduction et envoi de l'image…");
      const image = await processImage(file);
      const url = await uploadCover(image);
      uploadedCovers.current.push(url);
      setMagazine(prev => ({ ...prev, cover_image_url: url }));

      setBusy('Lecture du texte de la couverture…');
      try {
        const keywords = extractKeywords(await performOCR(image));
        setMagazine(prev => ({ ...prev, keywords: [...new Set([...(prev.keywords ?? []), ...keywords])] }));
        setSuccess(keywords.length ? `Couverture envoyée, ${keywords.length} mots-clés proposés (à vérifier)` : 'Couverture envoyée');
      } catch (ocrError) {
        console.error('OCR :', ocrError);
        setSuccess("Couverture envoyée (la lecture automatique du texte n'a rien donné)");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de l'image");
    } finally {
      setBusy(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const startCamera = async () => {
    // Sur téléphone, le sélecteur de fichier ouvre directement l'appareil photo
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      cameraInputRef.current?.click();
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setShowCamera(true);
    } catch {
      setError("Impossible d'accéder à la caméra");
    }
  };

  // Le flux est branché une fois la vidéo affichée
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      stopCamera();
      if (blob) handleFile(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) await createMagazine(magazine);
      else if (id) await updateMagazine(id, magazine);
      // Ménage : anciennes couvertures remplacées ou retirées pendant la saisie
      const inutiles = [savedCover.current, ...uploadedCovers.current].filter(url => url && url !== magazine.cover_image_url);
      await Promise.all(inutiles.map(url => removeCoverByUrl(url)));
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMagazine(prev => ({ ...prev, [name]: value }));
  };

  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword) return;
    setMagazine(prev => ({ ...prev, keywords: [...new Set([...(prev.keywords ?? []), keyword])] }));
    setNewKeyword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center">
        <button onClick={() => navigate('/admin')} className="mr-3 p-2 text-gray-400 hover:text-gray-600" aria-label="Retour">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Ajouter un numéro' : 'Modifier le numéro'}</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-4 flex" role="alert">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 mt-4 flex" role="status">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="ml-3 text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Revue (titre)</label>
            <input type="text" name="title" id="title" required value={magazine.title} onChange={handleChange} placeholder="Ex : Modèle Magazine" className={champ} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="issue_number" className="block text-sm font-medium text-gray-700">Numéro</label>
            <input type="text" name="issue_number" id="issue_number" required value={magazine.issue_number} onChange={handleChange} className={champ} />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700">Date de parution</label>
            <input type="date" name="publication_date" id="publication_date" value={magazine.publication_date ?? ''} onChange={handleChange} className={champ} />
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description, sommaire</label>
            <textarea name="description" id="description" rows={4} value={magazine.description ?? ''} onChange={handleChange} className={champ} />
          </div>

          <div className="sm:col-span-2 flex items-center sm:pt-6">
            <input
              type="checkbox"
              id="has_plan"
              checked={!!magazine.has_plan}
              onChange={e => setMagazine(prev => ({ ...prev, has_plan: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="has_plan" className="ml-2 text-sm font-medium text-gray-700">Plan encarté</label>
          </div>
          {magazine.has_plan && (
            <div className="sm:col-span-4">
              <label htmlFor="plan_model_name" className="block text-sm font-medium text-gray-700">Modèle du plan</label>
              <input type="text" name="plan_model_name" id="plan_model_name" value={magazine.plan_model_name ?? ''} onChange={handleChange} placeholder="Ex : Piper Cub J3" className={champ} />
            </div>
          )}

          <div className="sm:col-span-6">
            <span className="block text-sm font-medium text-gray-700">Couverture</span>
            <div
              className={`mt-1 flex justify-center px-6 py-6 border-2 border-dashed rounded-md ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-3 text-center">
                {magazine.cover_image_url ? (
                  <div className="relative inline-block">
                    <img src={magazine.cover_image_url} alt="Couverture" className="mx-auto h-40 w-auto rounded shadow" />
                    <button
                      type="button"
                      onClick={() => setMagazine(prev => ({ ...prev, cover_image_url: null }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      aria-label="Retirer la couverture"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}

                {busy ? (
                  <p className="flex items-center justify-center text-sm text-blue-700">
                    {busy.startsWith('Lecture') ? <ScanText className="h-4 w-4 mr-2" /> : <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    {busy}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                      <label htmlFor="file-upload" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                        Choisir une image
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''; }}
                        />
                      </label>
                      <span className="text-gray-500">ou la glisser ici</span>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Prendre une photo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      L'image est réduite avant l'envoi, et son texte est lu pour proposer des mots-clés.
                    </p>
                  </>
                )}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''; }}
                />
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="new-keyword" className="block text-sm font-medium text-gray-700 mb-2">Mots-clés</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(magazine.keywords ?? []).map(keyword => (
                <span key={keyword} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => setMagazine(prev => ({ ...prev, keywords: (prev.keywords ?? []).filter(k => k !== keyword) }))}
                    className="ml-1 p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                    aria-label={`Retirer ${keyword}`}
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="new-keyword"
                type="text"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                placeholder="Ajouter un mot-clé"
                className={champ.replace('mt-1 ', '')}
              />
              <button
                type="button"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                aria-label="Ajouter le mot-clé"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !!busy}
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 min-h-0 w-full object-contain" />
          <div className="p-4 flex justify-center space-x-4">
            <button type="button" onClick={capturePhoto} className="px-5 py-3 bg-white rounded-full shadow-lg text-gray-800 hover:bg-gray-100" aria-label="Prendre la photo">
              <Camera className="h-6 w-6" />
            </button>
            <button type="button" onClick={stopCamera} className="px-5 py-3 bg-red-500 rounded-full shadow-lg text-white hover:bg-red-600" aria-label="Fermer la caméra">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
