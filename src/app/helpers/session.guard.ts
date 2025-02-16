
import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
// import { data } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class SessionGuard implements CanActivate {
  constructor(public router: Router){}
  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const user = JSON.parse(sessionStorage.getItem('currentUser') ?? 'null');
        console.log(user);

        if (user && user.profiles[0].name.toLowerCase().includes('boutique')) {
          this.router.navigate(['/account-seller/dashboard']);
          return false;
        }else if (user && !user.profiles[0].name.toLowerCase().includes('boutique')){
          this.router.navigate(['/account-customer']);
          return false;
        }

        return true;
    }
}
