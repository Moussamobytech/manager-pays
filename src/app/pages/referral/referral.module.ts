import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferralComponent } from './referral.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestimonialsComponent } from './testimonials/testimonials.component';

const routes: Routes = [
  { path: '', component: ReferralComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [ReferralComponent,TestimonialsComponent],
  exports:[TestimonialsComponent],
})
export class ReferralModule { }
