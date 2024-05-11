import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NewsletterComponent } from './newsletter.component';

export const routes: Routes = [
  { path: '', component: NewsletterComponent, pathMatch: 'full' },
  { path: 'newsletter', component: NewsletterComponent, data: { breadcrumb: 'Newsletter ' } }

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
    NewsletterComponent
  ]
})
export class NewsletterModule { }
