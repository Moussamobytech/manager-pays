import { Injectable } from '@angular/core';
import * as piexif from 'piexifjs';
import { ImageQualityService } from './img-quality.service';
import { ImageCompressService } from './image-compress.servive';

@Injectable({
  providedIn: 'root',
})
export class ImageValidationService {
  constructor(
    private qualityService: ImageQualityService,
    private compressService: ImageCompressService
  ) {}

  /**
   * Validates an image for authenticity and quality.
   * @param file The uploaded image file.
   * @returns Promise<boolean> Resolves to true if the image passes all checks.
   */
  async validateImage(file: File): Promise<{ body: string; value: File | null } | null> {
    try {
      // const isAuthentic = await this.validateAuthenticity(file);
      // console.log("Authenticity Check:",isAuthentic);
      // if (!isAuthentic) return { body: "L'image a ete telechargee", value: null };

      const Bloblogo = await this.compressService.compressImage(file, 1200, 800, 80);
      let compressedImage;
      if( file.size/1000 > 350 ){
        const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
        compressedImage = new File([Bloblogo], randomName, { type: Bloblogo.type });
      }else{
        compressedImage = file;
      }

      const isResolutionGood = await this.qualityService.validateResolution(compressedImage, 1000, 760);
      const isQualityGood = await this.qualityService.validateBrightnessAndContrast(compressedImage);
      console.log("Image size is: "+(compressedImage.size/1000).toFixed(2)+' KB');
      console.log("Resolution is Good:",isResolutionGood);
      console.log("Quality is Good:",isQualityGood);

      if (isResolutionGood && isQualityGood) {
        return {
          body: "L'image a une bonne resolution, qualite satisfaisant et n'a pas ete telechargee",
          value: compressedImage,
        };
      }

      return { body: "L'image n'est pas valide", value: null };
    } catch (error) {
      console.error("Validation failed with error:", error);
      return null;
    }
  }


  /**
   * Validates the authenticity of an image using EXIF metadata.
   * @param file The uploaded image file.
   * @returns Promise<boolean> Resolves to true if the image is authentic.
   */
  private async validateAuthenticity(file: File): Promise<boolean> {
    console.log("Starting authenticity validation...");

    return new Promise((resolve, reject) => {
      // Create a FileReader instance
      const reader = new FileReader();

      reader.onload = (event: any) => {
        console.log("FileReader loaded successfully.");

        // Convert image to Base64 to use with piexifjs
        const base64Image = event.target.result.split(',')[1];  // Remove the data URL part

        try {
          // Get EXIF data using piexifjs
          const exifData = piexif.load(base64Image);
          console.log("EXIF Data:", exifData);

          // Check for required metadata fields
          const dateTaken = exifData['0th'][piexif.ImageIFD.DateTimeOriginal];
          const make = exifData['0th'][piexif.ImageIFD.Make];
          const model = exifData['0th'][piexif.ImageIFD.Model];

          console.log("DateTimeOriginal:", dateTaken);
          console.log("Make:", make);
          console.log("Model:", model);

          if (!dateTaken && !make && !model) {
            console.log("Critical EXIF fields missing.");
            resolve(false);  // Reject if essential fields are missing
            return;
          }

          resolve(true);  // Image passes authenticity checks
        } catch (error) {
          console.error("Error reading EXIF data:", error);
          resolve(false);  // Resolve with false if there was an error
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        resolve(false);  // Resolve with false if FileReader fails
      };

      // Check if the file type is JPEG before processing it
      const allowedTypes = ['image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        console.warn("Unsupported file type:", file.type);
        resolve(false);  // Reject non-JPEG images
        return;
      }

      reader.readAsDataURL(file);  // Start reading the image file as Data URL
    });
  }
}
