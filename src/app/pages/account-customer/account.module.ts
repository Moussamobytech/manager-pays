import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthGuard } from 'src/app/helpers/auth.guard';
import { EarningsComponent } from './earnings/earnings.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

export const routes: Routes = [
  {
      path: '',
      canActivate: [AuthGuard],
      canLoad: [AuthGuard],
      children: [
          { path: '', component: AccountComponent },
          { path: 'earnings', component: EarningsComponent, data: {  breadcrumb: 'Mes Gains' } },
          { path: 'settings', component: AccountSettingsComponent, data: {  breadcrumb: 'Paramètres' } },
      ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  declarations: [
    AccountComponent,
    EarningsComponent,
    AccountSettingsComponent
  ],
  providers:[provideNgxMask()],
})
export class AccountCustomerModule { }
