import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from 'src/app/theme/components/swiper/swiper.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { InputFileModule } from 'src/app/theme/components/input-file/input-file.module';
import { CaracteristiquesListComponent } from './caracteristiques-list/list.component';
import { DialogComponent } from './modals/dialog.component';
// import { CaracteristiquesDetailComponent } from './Caracteristiques-detail/Caracteristiques-detail.component';


export const routes: Routes = [
  { path: '', redirectTo: 'Caracteristiques-list', pathMatch: 'full'},
  { path: 'list', component: CaracteristiquesListComponent, data: { breadcrumb: 'Caracteristiques List' } },
  // { path: 'Caracteristiques-detail', component: CaracteristiquesDetailComponent, data: { breadcrumb: 'Caracteristiques Detail' } },
  // { path: 'Caracteristiques-detail/:id', component: CaracteristiquesDetailComponent, data: { breadcrumb: 'Caracteristiques Detail' } },
  // { path: 'add-Caracteristiques', component:  DialogComponent, data: { breadcrumb: 'Caracteristiques add' } },
  // { path: 'add-Caracteristiques/:id', component:  DialogComponent, data: { breadcrumb: 'Caracteristiques edit' } },
 ]
@NgModule({
  declarations: [
    CaracteristiquesListComponent,
    // CaracteristiquesDetailComponent,
    DialogComponent
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
export class CaracteristiquesModule { }
