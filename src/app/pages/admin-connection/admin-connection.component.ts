import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-connection',
  templateUrl: './admin-connection.component.html',
  styleUrls: ['./admin-connection.component.scss']
})
export class AdminConnectionComponent implements OnInit {

  loginForm: UntypedFormGroup;
  formSubmitted: boolean = false;
  toSubmit: boolean = false;
  loading: boolean = false;
  
  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder,
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    let role = sessionStorage.getItem('auth-roles')!;

    if (role != null && role == "ROLE_ADMIN") {
      this.router.navigate(['/admin']);
    }
    this.loginForm = this.formBuilder.group({
      'phone': ['', Validators.compose([Validators.required])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  public goHome(): void {
    this.router.navigate(['/']); 
    // if(this.router.routerState.snapshot.url.includes("/admin")){
    //   this.router.navigate(['/admin']);
    // }
    // else{
    //   this.router.navigate(['/']);
    // } 
  }

  public onLoginFormSubmit(values:Object):void {
    console.log("values ::::::: ",values)
    console.log("values ::::::: ",values["phone"])
    console.log("values ::::::: ",values["password"])
    if (values["phone"] != '' && values["password"] != '') {
      // this.loading = true;
      let phone = values['phone']
      let pwd = this.formValues.password?.value
      
      this.authenticationService.login(phone, pwd)
        .subscribe(
          async (data: any) => {
            console.log("data ::::::: ",data)
            let authorities = data.authorities
            console.log("data ::::::: ",authorities)
            console.log("data ::::::: ",authorities[0])
            console.log("data ::::::: ",authorities[0].authority)
            if (authorities[0].authority != "ROLE_ADMIN") {
              this.snackBar.open('Vous n\'etes pas autorisées à accéder à cette interface. Merci de contacter l\'administrateur', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
              return;
            }
            let userInfo = await this.authenticationService.info(data.username);
            // this.loading = false;
            console.log("userInfo ::::::: ",userInfo)
            if (userInfo == null) {
              this.snackBar.open('Impossible de récuperer les informations du client, merci de réessayer à nouveau', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
              return;
            }
            this.router.navigate(["/admin"]);
          },
          (error: any) => {
            console.log(error);
            console.log(error.message);
            console.log(error.status);
            if (error.status == 401) {
              this.snackBar.open('Accès incorrect merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
            }else{
              this.snackBar.open('Une erreur interne s\'est produite, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
            }

            // this.loading = false;
          });
    }
  }

  /**
   * convenience getter for easy access of form fields
  */
  get formValues() { return this.loginForm.controls; }
}
