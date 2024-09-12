import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
// import { InfluencerDetailComponent } from './influencer-detail/influencer-detail.component';
// import { InfluencerDialogComponent } from './influencer-dialog/influencer-dialog.component';
import { InfluencerListComponent } from './influencer-list/influencer-list.component';
import { InfluencerDialogComponent } from './influencer-dialog/influencer-dialog.component';
import { InfluencerDetailComponent } from './influencer-detail/influencer-detail.component';


export const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full'},
  { path: 'list', component: InfluencerListComponent, data: { breadcrumb: 'Influencer List' } },
  { path: 'detail', component: InfluencerDetailComponent, data: { breadcrumb: 'Influencer Detail' } },
  { path: 'detail/:id', component: InfluencerDetailComponent, data: { breadcrumb: 'Influencer Detail' } },
  // { path: 'add-influencer', component:  InfluencerDialogComponent, data: { breadcrumb: 'Influencer add' } },
  // { path: 'add-influencer/:id', component:  InfluencerDialogComponent, data: { breadcrumb: 'Influencer edit' } },
 ]
@NgModule({
  declarations: [
    InfluencerListComponent,
    // InfluencerDetailComponent,
    InfluencerDialogComponent
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
export class InfluencerModule { }
