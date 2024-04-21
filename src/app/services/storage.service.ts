import { Injectable } from '@angular/core';
import SecureStorage from 'secure-web-storage';
const SECRET_KEY = 'secret_key';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { } public secureStorage = new SecureStorage(localStorage, {
    hash: function hash(key: any): any {
      key = CryptoJS.SHA256(key, SECRET_KEY);
      return key.toString();
    },
    // Encrypt the localstorage 
    encrypt: function encrypt(data: any) {
      data = CryptoJS.AES.encrypt(data, SECRET_KEY); data = data.toString();
      return data;
    },
    // Decrypt the encrypted 
    decrypt: function decrypt(data: any) {
      data = CryptoJS.AES.decrypt(data, SECRET_KEY);
      data = data.toString(CryptoJS.enc.Utf8); return data;
    }
  }
  );
}
