import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from '../../theme/components/swiper/swiper.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared/shared.module';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { SellerComponent } from './seller.component';
import { SellerCarousselComponent } from './seller-caroussel/seller-caroussel.component';
import { SellerProductCardComponent } from './seller-product-card/seller-product-card.component';
import { SellerNotAllowedComponent } from './seller-not-allowed/seller-not-allowed.component';

export const routes: Routes = [
  { path: '', redirectTo: '/',pathMatch: 'full' },
  { path: ':name', component: SellerComponent, pathMatch: 'full' },
  { path: ':currentUser/:code', component: SellerComponent, pathMatch: 'full' },
  { path: 'denied/not-allowed', component: SellerNotAllowedComponent, pathMatch: 'full', data: { breadcrumb: 'Inactive' } },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        SwiperModule,
        NgxPaginationModule,
        SharedModule,
        ShareButtonsModule,
        ShareIconsModule,
        PipesModule,
    ],
    declarations: [
      SellerComponent,
      SellerCarousselComponent,
      SellerProductCardComponent,
      SellerNotAllowedComponent,
   ],
    providers: [],
    exports: []
})
export class SellerModule { }
