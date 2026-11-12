function base64ToUint8Array(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const MAX_FILE_SIZE = 200 * 1024; // 200KB in bytes
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;

export async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calcul des nouvelles dimensions en conservant le ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Utiliser des réglages de haute qualité
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dessiner l'image avec un fond blanc pour gérer la transparence
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Essayer différents formats et qualités jusqu'à obtenir une taille inférieure à MAX_FILE_SIZE
        const formats: Array<{ type: string; quality: number }> = [
          { type: 'image/jpeg', quality: QUALITY },
          { type: 'image/jpeg', quality: 0.6 },
          { type: 'image/jpeg', quality: 0.4 },
          { type: 'image/jpeg', quality: 0.2 },
          { type: 'image/jpeg', quality: 0.1 }
        ];

        let processedBlob: Blob | null = null;
        
        for (const { type, quality } of formats) {
          const base64Data = canvas.toDataURL(type, quality).split(',')[1];
          const uint8Array = base64ToUint8Array(base64Data);
          
          if (uint8Array.byteLength <= MAX_FILE_SIZE) {
            processedBlob = new Blob([uint8Array], { type });
            break;
          }
        }

        if (!processedBlob) {
          // If even the lowest quality doesn't meet the size requirement,
          // use the lowest quality blob anyway
          const lowestQualityFormat = formats[formats.length - 1];
          const base64Data = canvas.toDataURL(lowestQualityFormat.type, lowestQualityFormat.quality).split(',')[1];
          const uint8Array = base64ToUint8Array(base64Data);
          processedBlob = new Blob([uint8Array], { type: lowestQualityFormat.type });
          console.warn('Could not compress image to target size, using lowest quality available.');
        }

        // Créer un nouveau fichier à partir du blob
        const processedFile = new File([processedBlob], file.name, {
          type: processedBlob.type,
          lastModified: file.lastModified,
        });

        resolve(processedFile);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
