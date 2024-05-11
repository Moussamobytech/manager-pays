import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { InformationComponent } from './information.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { UpdatePasswordComponent } from './update-password/update-password.component';

export const routes: Routes = [
  { path: '', component: InformationComponent, pathMatch: 'full' },
  { path: 'information', component: InformationComponent, data: { breadcrumb: 'Information ' } },
  { path: 'update', component: UpdatePasswordComponent, data: { breadcrumb: 'Update password ' } },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule
  ],
  declarations: [
    InformationComponent,
    UpdatePasswordComponent
  ]
})
export class InformationModule { }
