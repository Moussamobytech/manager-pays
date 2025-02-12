import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignInComponent } from './sign-in/sign-in.component';
// import { UserAuthSessionComponent } from './user-auth-session/user-auth-session.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SignInFirstStepComponent } from './first-step/first-step.component';
import { SessionGuard } from 'src/app/helpers/session.guard';

const SessionRoutes: Routes = [
  {
    path: '',
    canActivate: [SessionGuard],
    children: [
      { path: '', component: SignInFirstStepComponent, pathMatch: 'full' },
      { path: 'sign-up', component: SignUpComponent, data: { breadcrumb: 'S\'inscrire' } },
      { path: 'sign-in', component: SignInComponent, data: { breadcrumb: 'Se connecter' }  },
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(SessionRoutes),
    NgxPaginationModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  declarations: [
    SignUpComponent,
    SignInComponent,
    SignInFirstStepComponent,
  ],
  providers: [provideNgxMask()]
})
export class SessionModule {}
