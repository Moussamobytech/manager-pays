import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ContactComponent } from './contact.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';

export const routes: Routes = [
  { path: '', component: ContactComponent, pathMatch: 'full' },
  { path: 'contact', component: ContactComponent, data: { breadcrumb: 'Contact ' } },
  { path: 'contact-detail', component: ContactDetailComponent, data: { breadcrumb: 'Contact detail' } },
  { path: 'contact-detail/:id', component: ContactDetailComponent, data: { breadcrumb: 'Contact detail' } }
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
    ContactComponent,
    ContactDetailComponent
  ]
})
export class ContactModule { }
