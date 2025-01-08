import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelOperationService } from 'src/app/services/excel-operation.service';
import { ImageQualityService } from 'src/app/services/img-quality.service';

@Component({
  selector: 'image-analysis',
  templateUrl:'./image_quality_check.component.html',
  styleUrls: ['./image_quality_check.component.scss'],
})
export class ImageAnalysisComponent implements OnInit {
  minWidth: number = 1024;
  minHeight: number = 768;
  imgForm: FormGroup;

  analysisResults: any = null;
  resolution: string;

  // selectedImages: File[] = [];

  constructor(private qualityService: ImageQualityService,private fb: FormBuilder, private exelExport:ExcelOperationService) {}

  ngOnInit(): void {
    this.imgForm = this.fb.group({
      'images': [null, Validators.required],
      'minWidth': [null, Validators.required],
      'minHeight': [null, Validators.required]
    });
  }

  // onFileSelected(event: any) {
  //   this.selectedImages = Array.from(event.target.files);
  //   console.log(this.selectedImages)
  // }

  async analyzeImages() {

    const results = [];

    if(this.imgForm.valid){
      this.resolution = this.imgForm.value.minWidth+'x'+this.imgForm.value.minHeight;
      for (const image of this.imgForm.value.images) {
        const resolutionCheck = await this.qualityService.validateResolution(
          image.file,
          this.imgForm.value.minWidth,
          this.imgForm.value.minHeight
        );
        const qualityCheck = await this.qualityService.validateBrightnessAndContrast(image.file);

        results.push({
          fileName: image.file.name,
          resolutionCheck,
          qualityCheck: qualityCheck.result,
          mesuredContrast: qualityCheck.contrast,
          mesuredbrightness: qualityCheck.brightness,
          overall: resolutionCheck && qualityCheck.result,
        });
      }

      this.analysisResults = results.map((element)=>{
        return this.mapToResult(element)
      });
      // console.log(this.analysisResults)
      this.exelExport.exportToExcel(this.analysisResults, 'Resultat du teste sur les '+this.analysisResults.length+' images');
    }
  }

  private mapToResult(element: any) {
    return {
      "Nom de l'image": element.fileName,
      "Resolution min": this.resolution,
      "contraste mesuré": Math.round(element.mesuredContrast).toString(),
      "Luminosité mesuré": Math.round(element.mesuredbrightness).toString(),
      "Resolution?": (element.resolutionCheck)?"Bonne":"Mauvaise",
      "Bonne qualité?": (element.overall)?"Oui":"Non"
    };
  }
}
