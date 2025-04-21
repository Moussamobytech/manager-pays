import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessingService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  /**
   * Sends images to the /bg_removing endpoint for background removal and upscaling.
   * @param images Array of File objects to be processed.
   * @returns Observable with the server response.
   */
  removeBackground(images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    console.log("formData ::: ",formData)

    return this.http.post(`${this.apiUrl}/bg_removing`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sends images to the /bg_replacing endpoint for background replacement.
   * @param images Array of File objects to be processed.
   * @param colors Array of color strings or 'auto' for automatic color selection.
   * @returns Observable with the server response.
   */
  replaceBackground(images: File[], colors: string[] | 'auto'): Observable<any> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image, image.name);
    });

    if (colors === 'auto') {
      formData.append('auto', 'true');
    } else {
      formData.append('colors', colors.join(','));
    }

    return this.http.post(`${this.apiUrl}/bg_replacing`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * @param imageName Name of the image file to be processed.
   * @returns URL of the processed image.
   */
  getImageUrl(imageName: string): string {
    return `${this.apiUrl}/serve-image/${imageName}`;
  }

  /**
   * Error handling for HTTP requests.
   * @param error HttpErrorResponse object.
   * @returns Observable that throws an error message.
  */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, body was: ${error.error}`;
    }
    return throwError(errorMessage);
  }
}
