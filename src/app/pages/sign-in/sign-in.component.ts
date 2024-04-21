import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthenticationService } from 'src/app/service/auth.service';
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

<<<<<<< HEAD
=======
  countries : any[] = [{id : "mali", nom: "Mali"}, {id:"civ", nom:"Côte d'ivoire"}];
  mask = '00 00 00 00'
  maskPlaceholder = 'XX XX XX XX'

>>>>>>> develop
  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder, 
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.authenticationService.logout();
    this.loginForm = this.formBuilder.group({
      'country': ['mali'],
      'phone': ['', Validators.compose([Validators.required])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])] 
    });

<<<<<<< HEAD
    this.registerForm = this.formBuilder.group({
      'firstname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'addresse': [''],
      'password': ['', Validators.required],
      'confirmPassword': ['', Validators.required]

      
    },{validator: matchingPasswords('password', 'confirmPassword')});
=======

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
>>>>>>> develop

  }

  public onLoginFormSubmit(values:Object):void {
    console.log("values ::::::: ",values)
<<<<<<< HEAD
    console.log("values ::::::: ",values["email"])
    console.log("values ::::::: ",values["password"])
    if (values["email"] != '' && values["password"] != '') {
      // this.loading = true;
      this.authenticationService.login(this.formValues.email?.value, this.formValues.password?.value)
=======
    console.log("values ::::::: ",values["phone"])
    console.log("values ::::::: ",values["password"])
    if (values["phone"] != '' && values["password"] != '') {
      // this.loading = true;
      let phone = ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone']
      let pwd = this.formValues.password?.value
      // this.formValues.phone.setValue( ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone'] )
      this.authenticationService.login(phone, pwd)
>>>>>>> develop
        .subscribe(
          async (data: any) => {
            console.log("data ::::::: ",data)
            let userInfo = await this.authenticationService.info(data.username);
            // this.loading = false;
            console.log("userInfo ::::::: ",userInfo)
            if (userInfo == null) {
              this.snackBar.open('Impossible de récuperer les informations du client, merci de réessayer à nouveau', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
<<<<<<< HEAD
=======
              return;
>>>>>>> develop
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
   * convenience getter for easy access to form fields
  */
  get formValues() { return this.loginForm.controls; }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      this.loading = true;
<<<<<<< HEAD
      this.authenticationService.login(this.formValues.email?.value, this.formValues.password?.value)
=======
      this.authenticationService.login(this.formValues.phone?.value, this.formValues.password?.value)
>>>>>>> develop
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
    
<<<<<<< HEAD
    this.formValues.email.setValue("")
=======
    this.formValues.phone.setValue("")
>>>>>>> develop
    this.formValues.password.setValue("")
    this.toSubmit = false;
  }

  

}
