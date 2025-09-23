import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { TilesComponent } from './tiles/tiles.component';
import { InfoCardsComponent } from './info-cards/info-cards.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { CAnalyticsComponent } from './c-analytics/c-analytics.component';
import { CSAnalyticsComponent } from './cs-analytics/cs-analytics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
];

@NgModule({
  declarations: [
    DashboardComponent,
    TilesComponent,
    InfoCardsComponent,
    AnalyticsComponent,
    CAnalyticsComponent,
    CSAnalyticsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    SwiperModule,
    InputFileModule,
    NgxPaginationModule,
    NgxChartsModule
  ]
})
export class DashboardModule { }
