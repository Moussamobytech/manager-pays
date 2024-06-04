import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SearchResultsComponent } from './search-results.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export const routes: Routes = [
  { path: '', component: SearchResultsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [
    SearchResultsComponent,

  ],

  exports: [
    SearchResultsComponent
  ]

})

export class SearchResultsModule { }
