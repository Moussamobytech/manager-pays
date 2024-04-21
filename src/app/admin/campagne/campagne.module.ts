import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CampagneListComponent } from './campagne-list/campagne-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CampageDetailComponent } from './campage-detail/campage-detail.component';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CampagneDialogComponent } from './campagne-dialog/campagne-dialog.component';

export const routes: Routes = [
  { path: '', redirectTo: 'campagne-list', pathMatch: 'full'},
  { path: 'campagne-list', component: CampagneListComponent, data: { breadcrumb: 'Campagne List' } },
  { path: 'campagne-detail', component: CampageDetailComponent, data: { breadcrumb: 'Campagne detail' } },
  { path: 'campagne-detail/:id', component: CampageDetailComponent, data: { breadcrumb: 'Campagne detail' } },
  { path: 'add-campagne', component: CampagneDialogComponent, data: { breadcrumb: 'Add Campagne' } },
  { path: 'add-campagne/:id', component: CampagneDialogComponent, data: { breadcrumb: 'Edit Campagne' } },
]

@NgModule({
  declarations: [
    CampagneListComponent,
    CampageDetailComponent,
    CampagneDialogComponent
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
export class CampagneModule { }
