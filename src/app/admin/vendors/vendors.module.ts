import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { NgxPaginationModule } from 'ngx-pagination';

import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { VendorDetailComponent } from './vendor-detail/vendor-detail.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { VendorAddProductDialogComponent } from './vendor-detail/vendor-add-product-dialog/vendor-add-product-dialog.component';

export const routes: Routes = [
  { path: '', component: VendorsListComponent, pathMatch: 'full' },
  { path: 'new', component: VendorFormComponent },
  { path: 'edit/:id', component: VendorFormComponent },
  { path: ':id', component: VendorDetailComponent }
];

@NgModule({
  declarations: [
    VendorsListComponent,
    VendorDetailComponent,
    VendorFormComponent,
    VendorAddProductDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDialogModule,
    InputFileModule
  ,NgxPaginationModule
  ]
})
export class VendorsModule {}