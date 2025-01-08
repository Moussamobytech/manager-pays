import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../shared/shared.module';
import { PipesModule } from '../../../theme/pipes/pipes.module';
import { CustomersComponent } from './customers.component';
import { CustomersData } from './customers.data';
import { CustomerActionsComponent } from './customer-actions/customer-actions.component';

export const routes: Routes = [
  { path: '', component: CustomersComponent, pathMatch: 'full' },
  { path: ':action/:id', component: CustomerActionsComponent, pathMatch: 'full' },
  { path: ':action', component: CustomerActionsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    InMemoryWebApiModule.forRoot(CustomersData, { delay: 500 }),
    NgxPaginationModule,
    SharedModule,
    PipesModule,
  ],
  declarations: [
    CustomersComponent,
    CustomerActionsComponent,
  ]
})
export class CustomersModule { }

