import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardComponent } from './dashboard.component';
import { TilesComponent } from './tiles/tiles.component';
import { InfoCardsComponent } from './info-cards/info-cards.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { MontlySalesComponent } from './montly-sales/montly-sales.component';
import { LatestOrdersComponent } from './latest-orders/latest-orders.component';
import { SellerInfoComponent } from './seller-info/seller-info.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'seller-info', component: SellerInfoComponent, data: { breadcrumb: 'Seller info' } },
  { path: 'seller-info/:id', component: SellerInfoComponent, data: { breadcrumb: 'Seller info' } },
];

@NgModule({
  declarations: [
    DashboardComponent,
    TilesComponent,
    InfoCardsComponent,
    AnalyticsComponent,
    MontlySalesComponent,
    SellerInfoComponent,
    LatestOrdersComponent
  ],
  imports: [
    NgxPaginationModule,
    SwiperModule,
    InputFileModule,

    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgxChartsModule
  ]
})
export class DashboardModule { }
