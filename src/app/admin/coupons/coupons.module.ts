import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'list',
    pathMatch: 'full'
  },
  { 
    path: 'list', 
    loadChildren: () => import('./coupons-list/coupons-list.module').then(m => m.CouponsListModule),
    data: { breadcrumb: 'Liste des coupons' }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class CouponsModule { } 