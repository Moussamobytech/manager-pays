import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class CommonMessageService {

  constructor(private router: Router, private location: Location, private toastr: ToastrService) { }
  
  
  async backToHome() {
    this.router.navigate(['/', { }]);
  }
  async backToLogin() {
    this.router.navigate(['/login']);
  }
  async goTo(url : string) {
    this.router.navigate([url]);
  }
  
  async goToWithData(url : any, data : any) {
    this.router.navigate([url,{data}]);
  }

  back() {
    this.location.back()
  }

  pleaseWaitLoading(){
    return Swal.fire({
      title: '<strong>Chargement...</strong>',
      // icon: 'info',
      html:
        '<div class="spinner-grow avatar-lg text-secondary m-2" role="status"></div> ' , 
        showConfirmButton:false,
        allowOutsideClick:false
    })
  }

  closeLoading(){
    Swal.close()
  }

  infoToast(message: string) {
    this.toastr.info(message, 'Info', {
      timeOut: 3000,
    });
  }

  warnToast(message : string) {
    this.toastr.warning(message, 'Warning', {
      timeOut: 3000,
    });
  }

  errorToast(message : string) {
      this.toastr.error(message, 'Error', {
        timeOut: 3000,
      });
  }

  successToast(message : string) {
    this.toastr.success(message, 'Success', {
      timeOut: 3000,
    });
  }
  
  currentPath() {
    return this.location.path();
  }

  breadCrumb() {
    let path : string[] = []
    let resTab: any[] = []
    path = this.location.path().split("/");
    path.forEach(val => {
      resTab.push({label : val})
    })
    return resTab;
  }
  
}
