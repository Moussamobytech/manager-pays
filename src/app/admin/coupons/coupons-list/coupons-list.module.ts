import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { CouponsListComponent } from './coupons-list.component';

export const routes: Routes = [
  { 
    path: '', 
    component: CouponsListComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    CouponsListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class CouponsListModule { } 