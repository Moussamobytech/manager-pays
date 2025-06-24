import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as envProd } from "../../environments/environment.prod";
import { environment as env } from "../../environments/environment";
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { CommonMessageService } from './common-message.service';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user: User | null = null;
 private resetPasswordUrl = 'https://api.fidelity-market.com/ecommerce/api/v1/users/reset-forgoten-password'

    constructor (private utility: CommonMessageService, private tokenStorage: TokenStorageService,
        private api: ApiService, private http : HttpClient) {
    }

    public async updateUserInfo(id : any, data : any){
        try {
          console.log("data updateUserInfo :::: ",data);
            let res : any = await this.api.putFile('/users/update-user?id='+id,data).toPromise()
             console.log("res updateUserInfo :::: ",res);
            if (res) {
                sessionStorage.setItem('currentUser', JSON.stringify(res));
            }
            return "OK"
        } catch (error : any) {
            console.error(error);
            return "KO"
        }
    }

    public async updateUser(id : any, data : any){
      try {
        // console.log(data)
          let res : any = await this.api.put('/users/update-user?id='+id,data).toPromise()
          return "OK"
      } catch (error : any) {
          console.error(error);
          return "KO"
      }
  }

  public async updatePassword(data : any){
    try {
      // console.log("::::::::::",data)
        let res : any = await this.api.post('/users/change-password',data).toPromise()
        // console.log("::::::RESSSSSSSSSSSS::::",res)

        return "OK"
    } catch (error : any) {
        console.error(error);
        return error
    }
  }

  public reset(username : any){
      // console.log("::::::::::",username)
      return this.api.get('/users/reset-forgoten-password?username='+username)

  }

  public delete(username : any){
      // console.log("::::::::::",username)
      return this.api.get('/users/delete-user?username='+username)

  }

  public uploadImange(username : any, file: File){
    const formdata = new FormData();
    formdata.append("file", file, file.name);
      return this.api.postFile('/users/update-user-image?username='+username,formdata);
  }


resetPassword(username: string, newpassword: string): Observable<any> {
  const url = this.resetPasswordUrl;
  const body = { username, newpassword };
  return this.http.post(url, body);
}


    /**
     * Returns the current user
     */
    public currentUser(): User | null {
        if (this.user == null || this.user == undefined) {
            this.user = JSON.parse(sessionStorage.getItem('currentUser')!);
        }
        // console.log(this.user);

        return this.user;
    }

    async info(username: string): Promise<any> {
      try {
        let currentUser = await this.api.get(`/users/info-user-by-username?username=`+username).toPromise();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        return currentUser;
      } catch (error) {
        console.error(error)
        return null;
      }
    }


     getUserInfo(username: string): Observable<any>{
   
       return this.api.get(`/users/info-user-by-username?username=`+username);
     
    }

    getAllUsers():Observable<User[]> {
      try{
        let users:Observable<User[]> = this.api.get("users/list");
        return users;
      }catch(error){
        console.error("getAllusers() error: "+error)
        return null;
      }
    }

    list() {
        return this.api.get(`/users/list`).toPromise();
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
     * @param boutique boutique of user
     * @param logo logo of user
     * @param phoneNumber phoneNumber of user
     * @param role role of user
     * @param email email of user
     * @param addresse addresse of user
     * @param username username of user
     * @param password password of user
     * @param countries le pays d'utilisateur
     */
    signup(formData: any): any {
        console.log("::::::::::::::: FORM DATA = ",formData.get("countries"));
        return this.api.postFile(`/users/register`, formData);
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


    recharge(amount: number, userId: string): Observable<any> {
      // console.log('Request URL:', `/users/recharge/${userId}?amount=${amount}`); // Debugging line

      return this.api.post(`/users/recharge/${userId}?amount=${amount}`, {});
    }

    supprimerUser(id: string): Observable<any> {
      return this.api.delete(`/users/supprimer/${id}`);
    }

    public setStatus(id: string, etat: string): Observable<any> {
      return this.api.put(`/users/etat/${id}?state=${etat}`, null).pipe();
    }

    getUserByPhone(phone: string): Observable<any> {      
      return this.api.get(`/users/get-by-phone/${phone}`);
    }

    gainList(parrainId: string): Observable<any> {
      return this.api.get(`/users/gain-list/${parrainId}`);
    }


}

