import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageQualityService {
  constructor() {}

  /**
   * Validates the resolution of an image.
   * @param file The uploaded image file.
   * @param minWidth Minimum acceptable width.
   * @param minHeight Minimum acceptable height.
   * @returns Promise<boolean> Resolves to true if resolution is acceptable, otherwise false.
   */
  validateResolution(file: File, minWidth: number, minHeight: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const isResolutionGood = img.width >= minWidth && img.height >= minHeight;
        URL.revokeObjectURL(url);
        resolve(isResolutionGood);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject('Error loading image.');
      };

      img.src = url;
    });
  }

  /**
   * Validates brightness and contrast of an image.
   * @param file The uploaded image file.
   * @returns Promise<boolean> Resolves to true if brightness and contrast are acceptable.
   */
  validateBrightnessAndContrast(file: File): Promise<{brightness:number,contrast:number,result:boolean}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;

        let totalBrightness = 0;
        let brightnessVariance = 0;
        let pixelCount = 0;

        // Loop through pixels (each pixel has R, G, B, A values)
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // Calculate brightness as a weighted average
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += brightness;
          pixelCount++;
        }

        const averageBrightness = totalBrightness / pixelCount;

        // Calculate brightness variance (to check for contrast)
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          brightnessVariance += Math.pow(brightness - averageBrightness, 2);
        }

        brightnessVariance = Math.sqrt(brightnessVariance / pixelCount);

        URL.revokeObjectURL(url);

        // Validate brightness and contrast
        console.log("average Contrast: ",brightnessVariance)
        console.log("average Brightness: ",averageBrightness)
        const isBrightnessGood = averageBrightness > 70 && averageBrightness < 190; // Not too dark or bright
        const isContrastGood = brightnessVariance > 30; // Ensure sufficient contrast

        resolve({
          brightness: averageBrightness,
          contrast: brightnessVariance,
          result:isBrightnessGood && isContrastGood,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject('Erreur lors du chargement de l\'image.');
      };

      img.src = url;
    });
  }
}
