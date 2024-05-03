import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const SessionRoutes: Routes = [{
  path: '',
  redirectTo: 'login',
  pathMatch: 'full',
},{
  path: '',
  children: [{
    path: 'login',
    component: LoginComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }
 ]
}];
