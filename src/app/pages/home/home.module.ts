import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule


  ],
  declarations: [
    HomeComponent,

  ]
})
export class HomeModule { }
