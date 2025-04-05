import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CartComponent } from './cart.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

export const routes: Routes = [
  { path: '', component: CartComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    NgxMaskPipe,
    NgxMaskDirective
  ],
  declarations: [
    CartComponent
  ],
  providers:[provideNgxMask()],
})
export class CartModule { }
