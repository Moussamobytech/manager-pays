import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { BrandListComponent } from './brand-list/brand-list.component';
import { BrandDetailComponent } from './brand-detail/brand-detail.component';
import { BrandDialogComponent } from './brand-dialog/brand-dialog.component';


export const routes: Routes = [
  { path: '', redirectTo: 'brand-list', pathMatch: 'full'},
  { path: 'brand-list', component: BrandListComponent, data: { breadcrumb: 'Brand List' } },
  { path: 'brand-detail', component: BrandDetailComponent, data: { breadcrumb: 'Brand Detail' } },
  { path: 'brand-detail/:id', component: BrandDetailComponent, data: { breadcrumb: 'Brand Detail' } },
  { path: 'add-brand', component:  BrandDialogComponent, data: { breadcrumb: 'Brand add' } },
  { path: 'add-brand/:id', component:  BrandDialogComponent, data: { breadcrumb: 'Brand edit' } },
 ]
@NgModule({
  declarations: [
    BrandListComponent,
    BrandDetailComponent,
    BrandDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SwiperModule,
    InputFileModule
  ]
})
export class BrandModule { }
