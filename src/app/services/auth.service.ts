import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as envProd } from "../../environments/environment.prod";
import { environment as env } from "../../environments/environment";
import { Observable, map, throwError } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseProd = envProd.api;
  // private base = env.api;
  constructor(private api: ApiService) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${this.auth_token}`
    }),
  }

  login(username:any, password:any){
    let API_URL = `${this.baseProd}users/login`
    const loginData ={
      'username':username,
      'password':password
    };

    const login =  this.api.post(API_URL,{ loginData }).subscribe(
      (data) => {
        console.log("login res ::::: ",data);
        return data;
      },
        (err: any) => {
          return this.handleError(err);
        }
      );
    return login;
  }

  handleError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error.status <= 0 || (error.error && error.error.status <= 0)) {
        console.error('Problem de connexion');
        // You can handle no network connectivity here
      } else if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );
      }
      return throwError(()=> new Error(error.error && error.error.message) || 'Erreur d\'accès au serveur');
    } else {
      console.error('An unexpected error occurred:', error);
      return throwError('Erreur inattendue: ' + error);
    }
  }
}
