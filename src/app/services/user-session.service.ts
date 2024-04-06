import { Injectable } from '@angular/core';


// var CryptoJS = require("crypto")
const SECRET_KEY = 'secret_key';

@Injectable({
  providedIn: 'root'
})

/**
 * User Session storage service
 * Provides methods to get, set, remove, clear session storage items related to the user.
 */
export class UserSessionService {

    /**
     * set session storage item
     * @param key
     * @param value
     */
    setItem(key: string, value: any) {
      // console.log("setJsonValue key :::: ",key);
       // console.log("setJsonValue key :::: ",CryptoJS);
       // console.log("setJsonValue key :::: ",CryptoJS.AES);
       // console.log("setJsonValue :::: ",CryptoJS.AES.encrypt(value, SECRET_KEY).toString());

       // this.localStorage.setItem(key, console.log("setJsonValue key :::: ",key);
       // console.log("setJsonValue :::: ",CryptoJS.AES.encrypt(value, SECRET_KEY).toString());

       // this.localStorage.setItem(key, CryptoJS.AES.encrypt(value, SECRET_KEY).toString())
       // sessionStorage.setItem(key, CryptoJS.AES.encrypt(value, SECRET_KEY).toString());
       sessionStorage.setItem(key, value);
     }

     /**
      * get session storage item
      * @param key
      */
     getItem(key: string): any {
       var value = sessionStorage.getItem(key);
       // let value = this.localStorage.getItem(key)
       if (value) {
         // return CryptoJS.AES.decrypt(value, SECRET_KEY).toString(CryptoJS.enc.Utf8)
         return value
       }
       return JSON.parse("{}");
     }

     /**
      * remove session storage item
      * @param key
      */
     removeItem(key: string) {
         sessionStorage.removeItem(key);
     }

     /**
      * remove all session storage items
      */
     clear() {
       // sessionStorage.clear()
       for(let i=0; i<sessionStorage.length; i++){
         const key = sessionStorage.key(i)
         if (key !== 'theme-key') {
           sessionStorage.removeItem(key)
         }
       }

     }

}
