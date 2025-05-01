import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { ImageProcessingService } from 'src/app/services/img-processing.service';
import { firstValueFrom } from 'rxjs';

interface ImageData {
  bgrep_img: string;
  bgless_img: string;
  color: string;
  index: number;
}

@Component({
  selector: 'app-img-improve-dialog',
  templateUrl: './img-improve-dialog.component.html',
  styleUrls: ['./img-improve-dialog.component.scss']
})
export class ImgImproveDialogComponent implements OnInit {
  images: ImageData[] = [];
  selectedImages: ImageData[] = [];
  customColor: string = null;
  showAll: boolean = false;

  // List of color options including a transparent option
  readonly colors: {name: string, hex: string}[] = [
    {name: 'Blanc', hex: '#FFFFFF'},{name: 'Gris clair', hex: '#F5F5F5'},
    {name: 'Jaune pale', hex: '#FFF8E1'},{name: 'Rose clair', hex: '#FBE4E8'},
    {name: 'Menthe clair', hex: '#E8F6F3'},{name: 'Bleu clair', hex: '#E0F0FF'},
    {name: 'Lavande', hex: '#F0E6FF'},{name: 'Rouge fonc ', hex: '#7D2027'},
    {name: 'Turquoise', hex: '#4BBFBF'},{name: 'Jaune vif', hex: '#FFDA44'},
    {name: 'Noir', hex: '#F9B8A7'},{name: 'Rouge corail', hex: '#FF6B6B'}
  ];

  constructor(
    private imgProcessingApi: ImageProcessingService,
    public dialogRef: MatDialogRef<ImgImproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { images: string[], auto: boolean },
    private cm: CommonService,
  ) {
    data.images.forEach((image, index) => {
      this.images.push({
        bgrep_img: '',
        bgless_img: image,
        color: '',
        index: index
      });
    });
  }

  ngOnInit(): void {
    console.log("Initialized images:", this.images);
  }

  async selectColor(color: string): Promise<void> {
    if (!this.selectedImages.length) {
      this.cm.openWarningSnackBar("Aucune images selectionnée.");
      return;
    }

    // If the selected color represents transparency, reset the images
    if (color ==='transparent') {
      this.selectedImages.forEach(image => {
        const img = this.images.find(img => img.index === image.index);
        if (img) {
          img.bgrep_img = img.bgless_img;
          img.color = '';
        }
      });
      this.selectedImages = [];
      return;
    }

    try {
      // we convert selected images to File objects
      const imageFiles = await Promise.all(
        this.selectedImages.map(image =>
          this.convertUrlToFile(this.getImagePath(image.bgless_img),image.bgless_img)
        )
      );

      const colorsArray = imageFiles.map(() => color);

      // firstValueFrom to await the observable response
      const response = await firstValueFrom(
        this.imgProcessingApi.replaceBackground(imageFiles, colorsArray)
      );

      if (!response?.results?.length) {
        console.error('No results returned from API');
        return;
      }

      // update each image with the processed info
      this.selectedImages.forEach((image, index) => {
        const imgToUpdate = this.images.find(img => img.index === image.index);
        if (imgToUpdate && response.results[index]?.output) {
          imgToUpdate.bgrep_img = response.results[index].output;
          imgToUpdate.color = color;
        }
      });

      // clear the selection after processing
      this.selectedImages = [];
    } catch (error) {
      console.error('Error processing selected images:', error);
    }
  }

  selectCustomColor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const customColor = input.value;
    this.customColor = customColor;
    this.selectColor(customColor);
  }

  // Convert an image URL to a File object
  convertUrlToFile(imageUrl: string, name): Promise<File> {
    return fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => new File([blob], name, { type: blob.type }));
  }

  // Get the full image path using the image processing service
  getImagePath(name: string): string {
    return this.imgProcessingApi.getImageUrl(name);
  }

  // Check if the currently selected images all share the given color
  hasColorSelected(color: string = null): boolean {
    return this.selectedImages.length > 0 && this.selectedImages.every(image => image.color === color);
  }

  checkTransparentColor(): boolean {
    return this.selectedImages.length > 0 && this.selectedImages.every(image => image.color === '');
  }

  // toggle image selection state
  toggleSelection(img: ImageData): void {
    const index = this.selectedImages.findIndex(image => image.index === img.index);
    if (index > -1) {
      this.selectedImages.splice(index, 1); // Deselect if already selected
    } else {
      this.selectedImages.push(img); // Select the image
    }
  }

  // Close the dialog without applying changes
  onCancel(): void {
    this.dialogRef.close();
  }

  // close the dialog and return the processed images
  onApply(): void {
    const processedImages = this.images.map(image => {
      const imgName = image.bgrep_img || image.bgless_img;
      return {
        link: this.getImagePath(imgName),
        preview: this.getImagePath(imgName)
      };
    });
    this.dialogRef.close(processedImages);
  }

  // trackBy function to optimize rendering
  trackByIndex(index: number, item: ImageData): number {
    return item.index;
  }
}
