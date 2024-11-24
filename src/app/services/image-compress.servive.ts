import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressService {
  constructor() {}

  async compressImage(file: File, maxWidth: number, maxHeight: number, quality: number = 80): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (event: any) => {
        image.src = event.target.result;

        image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          let { width, height } = image;

          // Resize maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (maxHeight / width) * height;
              width = maxWidth;
            } else {
              width = (maxWidth / height) * width;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(image, 0, 0, width, height);

          // Blob conversion
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Image compression failed'));
              }
            },
            'image/jpeg',
            quality/100 //values expected (0.1 - 1)
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
