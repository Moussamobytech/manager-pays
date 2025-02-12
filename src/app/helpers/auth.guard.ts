
import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
// import { data } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(public router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let user  = JSON.parse(sessionStorage.getItem('currentUser')!);

    if (user == null || user == undefined || JSON.stringify(user) === '{}' || user == "") {
      this.router.navigate(['authentication/sign-in'])
      return false;
    }

    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      let user  = JSON.parse(sessionStorage.getItem('currentUser')!);
      if (user == null || user == undefined || JSON.stringify(user) === '{}' || user == "") {
        this.router.navigate(['/sign-in'])
        return false;
      }

      return true;
  }
}
