import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ImageAnalysisComponent } from './image_quality_check.component';
import { InputFileConfig, InputFileModule } from 'src/app/theme/components/input-file/input-file.module';

export const routes: Routes = [
  { path: '', component: ImageAnalysisComponent, pathMatch: 'full' }
];
const config: InputFileConfig = {
  fileAccept: '*'
};

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    InputFileModule.forRoot(config),
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [
    ImageAnalysisComponent
  ]
})
export class ImageAnalysisModule { }
