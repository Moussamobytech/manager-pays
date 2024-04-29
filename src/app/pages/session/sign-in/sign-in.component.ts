import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthenticationService } from 'src/app/services/auth.service';
import { validateEmail } from 'src/app/helpers';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm: UntypedFormGroup;
  registerForm: UntypedFormGroup;
  formSubmitted: boolean = false;
  toSubmit: boolean = false;
  loading: boolean = false;

  countries : any[] = [{id : "mali", nom: "Mali"}, {id:"civ", nom:"Côte d'ivoire"}];
  mask = '00 00 00 00'
  maskPlaceholder = 'XX XX XX XX'

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder,
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.authenticationService.logout();
    this.loginForm = this.formBuilder.group({
      'country': ['mali'],
      'phone': ['', Validators.compose([Validators.required])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });


  }

  handleChange($event){
    console.log("handleChange :::::::: ", $event);
    this.formValues.phone.setValue("")
    if ($event.value == 'mali') {
      this.mask ='00 00 00 00'
      this.maskPlaceholder = 'XX XX XX XX'
    }

    if ($event.value == 'civ') {
      this.maskPlaceholder = 'XX XX XX XXXX'
    }

  }

  public onLoginFormSubmit(values:Object):void {
    console.log("values ::::::: ",values)
    console.log("values ::::::: ",values["phone"])
    console.log("values ::::::: ",values["password"])
    if (values["phone"] != '' && values["password"] != '') {
      // this.loading = true;
      let phone = ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone']
      let pwd = this.formValues.password?.value
      // this.formValues.phone.setValue( ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone'] )
      this.authenticationService.login(phone, pwd)
        .subscribe(
          async (data: any) => {
            console.log("data ::::::: ",data)
            let userInfo = await this.authenticationService.info(data.username);
            // this.loading = false;
            console.log("userInfo ::::::: ",userInfo)
            if (userInfo == null) {
              this.snackBar.open('Impossible de récuperer les informations du client, merci de réessayer à nouveau', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
              return;
            }
            this.router.navigate(["/account/dashboard"]);
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

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      this.loading = true;
      this.authenticationService.login(this.formValues.phone?.value, this.formValues.password?.value)
        .subscribe(
          (data: any) => {
            console.log("data ::::::: ",data)
            this.router.navigate(["account/dashboard"]);
          },
          (error: any) => {
            console.log(error);
            this.loading = false;
          });
    }
  }

  reset($event : Event){
    console.log("resetting process ::::::::");

    this.formValues.phone.setValue("")
    this.formValues.password.setValue("")
    this.toSubmit = false;
  }



}
