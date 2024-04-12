import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as envProd } from "../../environments/environment.prod";
import { environment as env } from "../../environments/environment";
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { User } from '../models/user.models';
import { TokenStorageService } from './token-storage.service';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user: User | null = null;

    constructor (private utility: CommonMessageService, private tokenStorage: TokenStorageService,
        private api: ApiService) {
    }

    public async updateUserInfo(id : any, data : any){
        try {
            let res : any = await this.api.put('/users/update-user?id='+id,data).toPromise()
            console.log("res updateUserInfo :::: ",res);
            if (res) {
                sessionStorage.setItem('currentUser', JSON.stringify(res));
            }
            return "OK"
        } catch (error : any) {
            console.log(error);
            return "KO"
        }
    }



    /**
     * Returns the current user
     */
    public currentUser(): User | null {
        if (this.user == null || this.user == undefined) {
            this.user = JSON.parse(sessionStorage.getItem('currentUser')!);
        }
        console.log(this.user);

        return this.user;
    }

    async info(username: string): Promise<any> {
        try {
            let currentUser = await this.api.get(`/users/info-user-by-username?username=`+username).toPromise();
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            return currentUser;
        } catch (error) {
            console.log(error)
            return null;
        }

    }

    /**
     * Performs the login auth
     * @param username username of user
     * @param password password of user
     */
    login(username: string, password: string): any {

      return this.api.post(`/users/login`, { username, password })
          .pipe(map(
            (user :any)=> {
              // login successful if there's a jwt token in the response
              if (user && user.token) {
                  let roles = user.authorities[0].authority
                  console.log("roles :: ", roles);
                  // store user details and jwt in session
                  sessionStorage.setItem('currentUser', JSON.stringify(user));
                  sessionStorage.setItem('auth-token', JSON.stringify(user.token));
                  sessionStorage.setItem('auth-roles', roles);
              }
              return user;
            }
          ));
    }

    /**
     * Performs the signup auth
     * @param firstname firstname of user
     * @param lastname lastname of user
     * @param phoneNumber phoneNumber of user
     * @param role role of user
     * @param email email of user
     * @param addresse addresse of user
     * @param username username of user
     * @param password password of user
     */
    signup(formData: any): any {
      let data = {
        role : ["admin"],
        username : (formData.email || formData.phone),
        firstname : formData.prenom,
        lastname : formData.name,
        email : formData.email,
        phoneNumber :  formData.phone,
        adresse : formData.addresse,
        password : formData.password2,
        typeofUser : (formData.email)? 'email'  : 'tel'
      }
        return this.api.post(`/users/register`, data);
    }



    /**
     * Logout the user
     */
    logout(): void {
        // remove user from session storage to log user out
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('auth-roles');
        sessionStorage.removeItem('auth-token');
        this.user = null;
    }

}

