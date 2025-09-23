import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

// FlexLayout
import { FlexLayoutModule } from '@angular/flex-layout';

// Pagination
import { NgxPaginationModule } from 'ngx-pagination';

// Components
import { CategoriesComponent } from './categories.component';
import { CategorieDetailComponent } from './categorie-detail.component';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';

// Shared
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CategorieDetailComponent,
    CategoryDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Angular Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatChipsModule,

    // Flex Layout
    FlexLayoutModule,

    // Pagination
    NgxPaginationModule,
  ],
  exports: [
    CategoriesComponent,
    CategorieDetailComponent
  ],
  entryComponents: [
    CategoryDialogComponent,
    ConfirmDialogComponent
  ]
})
export class CategoryModule { }
