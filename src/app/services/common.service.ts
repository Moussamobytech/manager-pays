import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Location } from '@angular/common';
// import * as moment from "moment";
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  translations: any;
  actionButtonLabel = 'Retry';
  action = false;

  constructor( public snackBar: MatSnackBar,  private location: Location, private navCtrl: Router,) {}

  // translate(key){
  //   return this.translator.instant(key)
  // }

  // currengLang(){
  //   if (this.store.data && this.store.data.settings) {
  //     return this.store.data.settings.lang ||  'pt';
  //   }
  // }
  open(message) {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.verticalPosition = "top";
    config.horizontalPosition = "center";
    // config.panelClass = [addExtraClass];
    this.snackBar.open(message, this.action && this.actionButtonLabel, config);
  }

  //Snackbar that opens with failure background
  openFailureSnackBar(message){
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.verticalPosition = "top";
    config.horizontalPosition = "center";
    config.panelClass = ['red-snackbar', 'login-snackbar'];
    this.snackBar.open(message, this.action && this.actionButtonLabel, config);
   }

  openSuccessSnackBar(message){
    this.snackBar.open("Login Successful", "OK", {
      duration: 3000,
      panelClass: ['green-snackbar', 'login-snackbar'],
     });
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.verticalPosition = "top";
    config.horizontalPosition = "center";
    config.panelClass = ['green-snackbar', 'login-snackbar'];
    this.snackBar.open(message, this.action && this.actionButtonLabel, config);
  }

  async backToHome() {
    this.navCtrl.navigate(['/dashboard/home', { }]);
  }
  async backToLogin() {
    this.navCtrl.navigate(['/auth']);
  }
  goTo(url: string, user:boolean=true) {
    this.navCtrl.navigate([url], { state: { isCurrentUser: user } });
  }
  goToWithObject(url: string, data) {
    this.navCtrl.navigate([url], { state: data });
    // this.router.navigateByUrl('/dynamic', { state: data });
  }

  async goToWithData(url : string, data: any) {
    this.navCtrl.navigate([url,{data}]);
  }

  back() {
    this.location.back()
  }

  // getFormatDate(date: string) {
  //   return moment(date).format('DD MMM, YYYY');
  // }

  // getFormatTime(date: string) {
  //   return moment(date).format('LT');
  // }

  convertBlobToBase64 = (blob: any) => new Promise((resolve, reject) => {
     // console.log("Conversion start");
      const reader = new FileReader;
     // console.log("Conversion reader");
      reader.onerror = reject;
      reader.onload = () => {
   //     console.log("Conversion onload");
        resolve(reader.result);
      };
   //   console.log("Conversion almost");
      reader.readAsDataURL(blob);
  });

  convertBlobToBase64v2 (blob : any){
    var base64data;
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
        base64data = reader.result;
        console.log(base64data);
    }
    return base64data;
  }

  blobToBase64(blob: Blob) {
    // const urlToBlob = window.URL.createObjectURL(blob)
    // console.log("urlToBlob ::::",urlToBlob);

  // this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlToBlob);
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      // reader.onload = function(){
      //   let output: any = document.getElementById('blah');
      //   output.src = reader.result;
      // }
      reader.onload = () => {
      //  console.log("Conversion onload");
        resolve(reader.result);
      };
      // reader.readAsBinaryString(blob);
      // reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);

    });
  }


}
