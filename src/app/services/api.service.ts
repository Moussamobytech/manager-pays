import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError, from } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  outdateAlert: any = null;
  timeoutTime = 60000;
  user: any;
  msisdn: any;
  headers: HttpHeaders = new HttpHeaders();

  url = environment.api;

  constructor(public http: HttpClient) {
    this.user = JSON.parse(sessionStorage.getItem('currentUser')!);
    this.msisdn = sessionStorage.getItem('msisdn')!;
    console.log('this.user ::::: ', this.user);
    console.log('this.msisdn ::::: ', this.msisdn);
  }

  appendAccessToken(headers: HttpHeaders) {
    let token = JSON.parse(sessionStorage.getItem('token')!);
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get username() {
    // return ""

    // return (this.storeService.currentUser && this.storeService.currentUser.user && (this.storeService.currentUser.user.nom + ' ' + this.storeService.currentUser.user.prenom)) || this.storeService.currentUser.login;
    return (
      (this.user && this.user?.nom + ' ' + this.user?.prenom) ||
      this.user?.msisdn
    );
  }
  get userna() {
    // return ""
    // let user =  this.sessionService.getItem("currentUser")
    let user = JSON.parse(sessionStorage.getItem('currentUser')!);
    // return (this.storeService.currentUser && this.storeService.currentUser.user && (this.storeService.currentUser.user.nom + ' ' + this.storeService.currentUser.user.prenom)) || this.storeService.currentUser.login;
    return user?.msisdn;
  }

  addCommonHeaders(headers: HttpHeaders) {
    // headers = headers.set('Accept-Charset', 'utf-8');
    console.log('user ::::::: ', this.user);
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('__username__', this.user?.msisdn || '');
    headers = headers.set('__agent__', window.navigator.userAgent);
    headers = headers.set('__vendor__', window.navigator.vendor);
    headers = headers.set('__platform__', window.navigator.platform);
    headers = headers.set('__language__', window.navigator.language);

    return headers;
  }

  addCommonHeadersForFile(headers: HttpHeaders) {
    // headers = headers.set('Accept-Charset', 'utf-8');
    console.log('user ::::::: ', this.user);

    // headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('__agent__', window.navigator.userAgent);
    headers = headers.set('__vendor__', window.navigator.vendor);
    headers = headers.set('__platform__', window.navigator.platform);
    headers = headers.set('__language__', window.navigator.language);

    // headers = headers.set('Content-Type', 'multipart/form-data');
    headers = headers.set('__username__', this.user?.msisdn || '');

    return headers;
  }

  get(endpoint: string, params?: any, reqOpts?: any, secure: boolean = true) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    const notNullParams: any = {};
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (const k of Object.keys(params)) {
        if (params[k] !== null && params[k] !== undefined) {
          reqOpts.params = reqOpts.params.set(k, params[k]);
          notNullParams[k] = params[k] + '';
        }
      }
    }
    if (secure) {
      reqOpts.headers = this.appendAccessToken(reqOpts.headers || new HttpHeaders());
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .get(fullUrl, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }

  private sanitizeBody(body: any) {
    const ret: any = {};
    for (const k of Object.keys(body)) {
      if (body[k] !== undefined) {
        ret[k] = body[k];
      }
    }
    return ret;
  }
  post(
    endpoint: string,
    body: any,
    reqOpts?: any,
    secure: boolean = true,
    timeOut?: number
  ) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .post(fullUrl, body, reqOpts)
      .pipe(
        timeout(timeOut || this.timeoutTime),
        catchError(this.handleError.bind(this))
      );
  }
  postFile(
    endpoint: string,
    body: any,
    reqOpts?: any,
    secure: boolean = true,
    timeOut?: number
  ) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeadersForFile(
      reqOpts.headers || new HttpHeaders()
    );
    reqOpts.reportProgress = true;
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .post(fullUrl, body, reqOpts)
      .pipe(
        timeout(timeOut || this.timeoutTime),
        catchError(this.handleError.bind(this))
      );
  }

  putFile(endpoint: string, body: any, reqOpts?: any, secure = true) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeadersForFile(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .put(fullUrl, body, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }

  put(endpoint: string, body: any, reqOpts?: any, secure = true) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .put(fullUrl, body, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }

  delete(endpoint: string, reqOpts?: any, secure: boolean = true) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .delete(fullUrl, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }

  patch(endpoint: string, body: any, reqOpts?: any, secure: boolean = true) {
    reqOpts = reqOpts || {};
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');

    return this.http
      .patch(fullUrl, body, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status <= 0 || (error.error && error.error.status <= 0)) {
      // this.commonMessager.showNoNetworkFail();
    }
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned ${JSON.stringify(error)} code ${JSON.stringify(
          error.status
        )}, ` + `body was: ${JSON.stringify(error.error)}`
      );
    }
    // return an observable with a user-facing error message
    // return throwError((error.error && error.error.message) ||
    //   'Erreur d\'accès au serveur');
    return throwError(error || "Erreur d'accès au serveur");
  }

  getImg(
    endpoint: string,
    params?: any,
    reqOpts?: any,
    secure: boolean = true
  ) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    const notNullParams: any = {};
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (const k of Object.keys(params)) {
        if (params[k] !== null && params[k] !== undefined) {
          reqOpts.params = reqOpts.params.set(k, params[k]);
          notNullParams[k] = params[k] + '';
        }
      }
    }
    if (secure) {
      reqOpts.headers = this.appendAccessToken(
        reqOpts.headers || new HttpHeaders()
      );
    }
    reqOpts.headers = this.addCommonHeaders(
      reqOpts.headers || new HttpHeaders()
    );
    reqOpts.observe = 'response';
    reqOpts.responseType = 'blob' as 'json';

    const fullUrl = this.url + '/' + endpoint.replace(/^\/+/, '');
    return this.http
      .get<Blob>(fullUrl, reqOpts)
      .pipe(timeout(this.timeoutTime), catchError(this.handleError.bind(this)));
  }
}
