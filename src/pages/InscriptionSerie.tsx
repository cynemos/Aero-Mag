import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, CheckCircle, Loader, RotateCcw, Save, ScanText, Trash2, Upload, X } from 'lucide-react';
import {
  MOIS, createMagazine, dateDeParution, emptyMagazine, getMagazines, lireParution, parutionValide, removeCoverByUrl,
  themesParTitre, uploadCover, type MagazineInput, type Parution,
} from '../lib/magazines';
import { REVUES_CONNUES, TITRES_CONNUS, extractCoverInfo, readCoverText } from '../lib/ocr';
import { processImage } from '../lib/imageProcessing';
import { chercherSommaire, texteDuSommaire } from '../lib/sommaires';
import { THEMES_PROPOSES, trierThemes } from '../lib/categories';

// Inscription en série : on photographie plusieurs couvertures à la suite, puis on lance la
// lecture de toutes ; chaque photo devient une fiche pré-remplie, à vérifier puis inscrire.

type Etat = 'attente' | 'lecture' | 'pret' | 'enregistrement' | 'inscrit' | 'erreur';

interface Photo {
  cle: string;
  file: File;
  apercu: string; // adresse locale de la photo, pour la vignette
  etat: Etat;
  fiche: MagazineInput;
  parution: Parution;
  message?: string;
}

const LIBELLES: Record<Etat, string> = {
  attente: 'En attente de lecture',
  lecture: 'Lecture en cours…',
  pret: 'À vérifier',
  enregistrement: 'Inscription…',
  inscrit: 'Inscrit au registre',
  erreur: 'Échec',
};

export function InscriptionSerie() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const photosRef = useRef(photos); // état à jour, lu pendant les traitements en série
  photosRef.current = photos;
  const [enCours, setEnCours] = useState(false);
  const [titres, setTitres] = useState<string[]>([]);
  const [themesRevues, setThemesRevues] = useState<Record<string, string>>({});
  const [themes, setThemes] = useState<string[]>(THEMES_PROPOSES);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fichiersInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMagazines()
      .then(liste => {
        setTitres(liste.map(m => m.title));
        setThemesRevues(themesParTitre(liste));
        setThemes(trierThemes([...THEMES_PROPOSES, ...liste.map(m => m.category)]));
      })
      .catch(() => undefined);
  }, []);

  // En quittant la page : couvertures envoyées mais non inscrites retirées du stockage
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    for (const p of photosRef.current) {
      URL.revokeObjectURL(p.apercu);
      if (p.etat !== 'inscrit') void removeCoverByUrl(p.fiche.cover_image_url);
    }
  }, []);

  // Avertit avant de fermer l'onglet s'il reste des photos non inscrites
  const nonInscrites = photos.filter(p => p.etat !== 'inscrit').length;
  useEffect(() => {
    if (!nonInscrites) return;
    const avertir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avertir);
    return () => window.removeEventListener('beforeunload', avertir);
  }, [nonInscrites]);

  const themeDe = (titre: string): string | undefined => themesRevues[titre.trim()] ?? REVUES_CONNUES[titre.trim()];

  const maj = (cle: string, modif: Partial<Photo>) =>
    setPhotos(prev => prev.map(p => (p.cle === cle ? { ...p, ...modif } : p)));

  const ajouter = (fichiers: Iterable<File>) => {
    const nouvelles: Photo[] = [];
    for (const file of fichiers) {
      if (!file.type.startsWith('image/')) continue;
      nouvelles.push({
        cle: crypto.randomUUID(),
        file,
        apercu: URL.createObjectURL(file),
        etat: 'attente',
        fiche: emptyMagazine(),
        parution: { mois: '', annee: '' },
      });
    }
    setPhotos(prev => [...prev, ...nouvelles]);
  };

  const retirer = (photo: Photo) => {
    URL.revokeObjectURL(photo.apercu);
    if (photo.etat !== 'inscrit') void removeCoverByUrl(photo.fiche.cover_image_url);
    setPhotos(prev => prev.filter(p => p.cle !== photo.cle));
  };

  // --- Appareil photo : sur ordinateur, la caméra reste ouverte entre les prises ---
  const ouvrirCamera = async () => {
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

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [showCamera]);

  const fermerCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const declencher = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (blob) ajouter([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })]);
    }, 'image/jpeg', 0.92);
  };

  // --- Lecture de toutes les photos en attente, une par une ---
  const lireTout = async () => {
    setEnCours(true);
    setError(null);
    for (const { cle, file } of photosRef.current.filter(p => p.etat === 'attente')) {
      maj(cle, { etat: 'lecture', message: undefined });
      let url: string;
      try {
        url = await uploadCover(await processImage(file));
      } catch {
        maj(cle, { etat: 'erreur', message: "Échec de l'envoi de l'image" });
        continue;
      }
      // Photo retirée pendant l'envoi : sa couverture ne sert plus
      if (!photosRef.current.some(p => p.cle === cle)) {
        void removeCoverByUrl(url);
        continue;
      }
      const fiche: MagazineInput = { ...emptyMagazine(), cover_image_url: url };
      let parution: Parution = { mois: '', annee: '' };
      try {
        const complet = (t: string) => {
          const i = extractCoverInfo(t, titres);
          return !!(i.title && i.issueNumber && i.publicationDate);
        };
        const info = extractCoverInfo(await readCoverText(file, complet), titres);
        if (info.title) {
          fiche.title = info.title;
          fiche.category = themeDe(info.title) ?? fiche.category;
        }
        if (info.issueNumber) fiche.issue_number = info.issueNumber;
        if (info.publicationDate) parution = lireParution(info.publicationDate, info.doubleIssue);
      } catch (ocrError) {
        console.error('OCR :', ocrError);
      }
      maj(cle, { etat: 'pret', fiche, parution });
    }
    setEnCours(false);
  };

  // --- Inscription ---
  const inscrire = async (cle: string) => {
    const photo = photosRef.current.find(p => p.cle === cle);
    if (!photo || photo.etat !== 'pret') return;
    if (!photo.fiche.title.trim() || !photo.fiche.issue_number.trim()) {
      maj(cle, { message: 'Indiquez la revue et le numéro' });
      return;
    }
    if (!parutionValide(photo.parution)) {
      maj(cle, { message: "Parution : indiquez le mois et l'année (4 chiffres), ou laissez les deux vides" });
      return;
    }
    maj(cle, { etat: 'enregistrement', message: undefined });
    try {
      // Sommaire archivé de l'éditeur, cherché avec la revue et le numéro vérifiés
      const sommaire = photo.fiche.description?.trim()
        ? null
        : await chercherSommaire(photo.fiche.title, photo.fiche.issue_number).catch(() => null);
      await createMagazine({
        ...photo.fiche,
        ...dateDeParution(photo.parution),
        ...(sommaire ? { description: texteDuSommaire(sommaire) } : {}),
      });
      maj(cle, { etat: 'inscrit', message: sommaire ? 'Sommaire ajouté à la fiche' : undefined });
      // Une nouvelle revue est ensuite proposée et reconnue comme les autres
      const titre = photo.fiche.title.trim();
      setTitres(prev => (prev.includes(titre) ? prev : [...prev, titre]));
      setThemesRevues(prev => ({ [titre]: photo.fiche.category ?? '', ...prev }));
    } catch (err) {
      maj(cle, { etat: 'pret', message: err instanceof Error ? err.message : "Échec de l'inscription" });
    }
  };

  const toutInscrire = async () => {
    setEnCours(true);
    for (const p of photosRef.current.filter(p => p.etat === 'pret')) await inscrire(p.cle);
    setEnCours(false);
  };

  const changerFiche = (cle: string, modif: Partial<MagazineInput>) =>
    setPhotos(prev => prev.map(p => (p.cle === cle ? { ...p, fiche: { ...p.fiche, ...modif }, message: undefined } : p)));

  const changerParution = (cle: string, modif: Partial<Parution>) =>
    setPhotos(prev => prev.map(p => (p.cle === cle ? { ...p, parution: { ...p.parution, ...modif }, message: undefined } : p)));

  const enAttente = photos.filter(p => p.etat === 'attente').length;
  const prets = photos.filter(p => p.etat === 'pret').length;
  const inscrits = photos.filter(p => p.etat === 'inscrit').length;
  const revues = [...new Set([...TITRES_CONNUS, ...titres].map(t => t.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="bouton-sobre !px-2.5" aria-label="Retour au registre">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="dorure text-3xl font-extrabold sm:text-4xl">Inscrire en série</h1>
      </div>
      <p className="mt-3 text-sm opacity-80">
        Photographiez les couvertures à la suite, puis lancez la lecture : chaque photo devient une fiche
        pré-remplie (revue, thème, numéro, parution) à vérifier avant de l'inscrire.
      </p>

      {error && (
        <div className="message-erreur mt-5" role="alert">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="parchemin mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={ouvrirCamera} disabled={showCamera} className="bouton-laiton">
            <Camera className="mr-2 h-4 w-4" />
            Photographier
          </button>
          <button type="button" onClick={() => fichiersInputRef.current?.click()} className="bouton-sobre">
            <Upload className="mr-2 h-4 w-4" />
            Choisir des photos
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { if (e.target.files) ajouter(e.target.files); e.target.value = ''; }}
          />
          <input
            ref={fichiersInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) ajouter(e.target.files); e.target.value = ''; }}
          />
        </div>

        {showCamera && (
          <div className="mt-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[60vh] rounded bg-black object-contain" />
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={declencher} className="bouton-laiton">
                <Camera className="mr-2 h-4 w-4" />
                Déclencher
              </button>
              <button type="button" onClick={fermerCamera} className="bouton-sobre">
                <X className="mr-2 h-4 w-4" />
                Fermer la caméra
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span>
            {photos.length} photo{photos.length > 1 ? 's' : ''}
            {enAttente > 0 && ` · ${enAttente} à lire`}
            {prets > 0 && ` · ${prets} à vérifier`}
            {inscrits > 0 && ` · ${inscrits} inscrite${inscrits > 1 ? 's' : ''}`}
          </span>
          <button type="button" onClick={lireTout} disabled={enCours || !enAttente} className="bouton-laiton">
            {enCours ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <ScanText className="mr-2 h-4 w-4" />}
            {enAttente === 1 ? 'Lire la photo' : `Lire les ${enAttente || ''} photos`.replace('  ', ' ')}
          </button>
          <button type="button" onClick={toutInscrire} disabled={enCours || !prets} className="bouton-sobre">
            <Save className="mr-2 h-4 w-4" />
            Tout inscrire
          </button>
          {inscrits > 0 && (
            <button type="button" onClick={() => photos.filter(p => p.etat === 'inscrit').forEach(retirer)} className="bouton-sobre">
              Retirer les inscrites
            </button>
          )}
        </div>
      </div>

      <datalist id="serie-revues">{revues.map(t => <option key={t} value={t} />)}</datalist>
      <datalist id="serie-themes">{themes.map(t => <option key={t} value={t} />)}</datalist>

      <ul className="mt-6 space-y-4">
        {photos.map((photo, index) => {
          const modifiable = photo.etat === 'pret';
          const { fiche, parution } = photo;
          return (
            <li key={photo.cle} className="parchemin flex gap-4 p-4">
              <img src={photo.apercu} alt={`Photo ${index + 1}`} className="h-36 w-24 flex-shrink-0 rounded object-cover sm:h-44 sm:w-32" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {photo.etat === 'inscrit' && <CheckCircle className="mr-1 inline h-4 w-4 text-green-700" />}
                    {(photo.etat === 'lecture' || photo.etat === 'enregistrement') && <Loader className="mr-1 inline h-4 w-4 animate-spin" />}
                    {LIBELLES[photo.etat]}
                  </p>
                  {photo.etat !== 'lecture' && photo.etat !== 'enregistrement' && (
                    <button type="button" onClick={() => retirer(photo)} className="bouton-sobre !px-2 !py-1" aria-label={`Retirer la photo ${index + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {photo.message && (
                  photo.etat === 'inscrit'
                    ? <p className="mt-1 text-sm italic">{photo.message}</p>
                    : <p className="mt-1 text-sm text-red-700" role="alert">{photo.message}</p>
                )}

                {photo.etat === 'erreur' && (
                  <button type="button" onClick={() => maj(photo.cle, { etat: 'attente', message: undefined })} className="bouton-sobre mt-2">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Réessayer
                  </button>
                )}

                {(modifiable || photo.etat === 'enregistrement' || photo.etat === 'inscrit') && (
                  <fieldset disabled={!modifiable} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6">
                    <input
                      list="serie-revues"
                      aria-label="Revue"
                      placeholder="Revue"
                      value={fiche.title}
                      onChange={e => {
                        const theme = themeDe(e.target.value);
                        changerFiche(photo.cle, { title: e.target.value, ...(theme ? { category: theme } : {}) });
                      }}
                      className="champ col-span-2 sm:col-span-3"
                    />
                    <input
                      aria-label="Numéro"
                      placeholder="Numéro"
                      value={fiche.issue_number}
                      onChange={e => changerFiche(photo.cle, { issue_number: e.target.value })}
                      className="champ sm:col-span-1"
                    />
                    <input
                      list="serie-themes"
                      aria-label="Thème"
                      placeholder="Thème"
                      value={fiche.category ?? ''}
                      onChange={e => changerFiche(photo.cle, { category: e.target.value })}
                      className="champ sm:col-span-2"
                    />
                    <select
                      aria-label="Mois de parution"
                      value={parution.mois}
                      onChange={e => changerParution(photo.cle, { mois: e.target.value })}
                      className="champ sm:col-span-3"
                    >
                      <option value="">Mois…</option>
                      {MOIS.map((nom, i) => <option key={nom} value={`${i + 1}`}>{nom}</option>)}
                      <optgroup label="Numéros doubles">
                        {MOIS.map((nom, i) => <option key={`${nom}+`} value={`${i + 1}+`}>{nom}-{MOIS[(i + 1) % 12]}</option>)}
                      </optgroup>
                    </select>
                    <input
                      inputMode="numeric"
                      maxLength={4}
                      aria-label="Année de parution"
                      placeholder="Année"
                      value={parution.annee}
                      onChange={e => changerParution(photo.cle, { annee: e.target.value.replace(/\D/g, '') })}
                      className="champ sm:col-span-1"
                    />
                    {modifiable && (
                      <button type="button" onClick={() => inscrire(photo.cle)} className="bouton-laiton col-span-2 sm:col-span-2">
                        <Save className="mr-2 h-4 w-4" />
                        Inscrire
                      </button>
                    )}
                  </fieldset>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
