import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SwiperModule } from '../../theme/components/swiper/swiper.module';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductZoomComponent } from './product-detail/product-zoom/product-zoom.component';
import { AddProductComponent } from './add-product/add-product.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryDialogComponent } from './categories/category-dialog/category-dialog.component';
import { CategorieDetailComponent } from './categories/categorie-detail/categorie-detail.component';
import { ProductStateComponent } from './product-state/product-state.component';

export const routes: Routes = [
  { path: '', redirectTo: 'product-list', pathMatch: 'full'},
  { path: 'categories', component: CategoriesComponent, data: { breadcrumb: 'Categories' } },
  { path: 'product-list', component: ProductListComponent, data: { breadcrumb: 'Product List' } },
  { path: 'product-state', component: ProductStateComponent, data: { breadcrumb: 'Product State' } },
  { path: 'product-detail', component: ProductDetailComponent, data: { breadcrumb: 'Product Detail' } },
  { path: 'product-detail/:id', component: ProductDetailComponent, data: { breadcrumb: 'Product Detail' } },
  { path: 'categorie-detail', component: CategorieDetailComponent, data: { breadcrumb: 'Categorie Detail' } },
  { path: 'categorie-detail/:id', component: CategorieDetailComponent, data: { breadcrumb: 'Categorie Detail' } },
  { path: 'add-product', component: AddProductComponent, data: { breadcrumb: 'Add Product' } },
  { path: 'add-product/:id', component: AddProductComponent, data: { breadcrumb: 'Edit Product' } },
];

@NgModule({
  declarations: [
    ProductListComponent,
    ProductStateComponent,
    ProductDetailComponent,
    ProductZoomComponent,
    AddProductComponent,
    CategoriesComponent,
    CategoryDialogComponent,
    CategorieDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    SwiperModule,
    InputFileModule
  ]
})
export class ProductsModule { }
