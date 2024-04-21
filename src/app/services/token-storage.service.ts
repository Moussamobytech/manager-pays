
import { Injectable } from '@angular/core';
import { LocalService } from './local.service';
const TOKEN_KEY = 'auth-token';
const ROLES_KEY = 'auth-roles';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  

  
  constructor(private localService: LocalService){}

  signOut(): void {
    this.localService.clearToken();
  }

  public saveToken(token: string): void {
    this.localService.setJsonValue(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return this.localService.getJsonValue(TOKEN_KEY);
  }

  public saveRoles(roles: string): void {
    this.localService.setJsonValue(ROLES_KEY, roles);
  }

  public getRoles(): string | null {
    return this.localService.getJsonValue(ROLES_KEY);
  }

  public saveUser(user: any): void {
    this.localService.setJsonValue(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = this.localService.getJsonValue(USER_KEY);
    if (typeof user !== 'object') {
      return JSON.parse(user);
    }

    return {};
  }




}


