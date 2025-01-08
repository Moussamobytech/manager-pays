import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressService {
  constructor() {}

  async compressImage(file: File, maxWidth: number=1200, maxHeight: number=800, quality: number = 80, normal: boolean = true ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (event: any) => {
        image.src = event.target.result;

        image.onload = () => {
          let { width, height } = image;

          if (normal && (width > maxWidth || height > maxHeight)) {
            if (width > height) {
              height = (maxHeight / width) * height;
              width = maxWidth;
            } else {
              width = (maxWidth / height) * width;
              height = maxHeight;
            }
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = normal ? width : image.width;
          canvas.height = normal ? height : image.height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Image compression failed'));
              }
            },
            'image/jpeg',
            file.size / 1000 > 350 // Compression quality if file > 350 KB
              ? quality / 100
              : 1 // Use highest quality for smaller files
          );
        };

        image.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);

      // Read file as a data URL
      reader.readAsDataURL(file);
    });
  }

}
