
import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
// import { data } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanLoad {
  constructor(public router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      let user  = JSON.parse(sessionStorage.getItem('currentUser')!);
      let role = sessionStorage.getItem('auth-roles')!;
      console.log("user :::: ",user);
      console.log("role :::: ",role);

      if (user == null || user == undefined || JSON.stringify(user) === '{}' || user == "" || role != "ROLE_ADMIN") {
        this.router.navigate(['/admin-connection'])
        return false;
      }
      
      return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      let user  = JSON.parse(sessionStorage.getItem('currentUser')!);
      let role = sessionStorage.getItem('auth-roles')!;
      if (user == null || user == undefined || JSON.stringify(user) === '{}' || user == "" || role != "ROLE_ADMIN") {
        this.router.navigate(['/admin-connection'])
        return false;
      }
      
      return true;
  }
}
