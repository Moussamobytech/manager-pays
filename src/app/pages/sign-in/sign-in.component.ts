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

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder, 
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])] 
    });

    this.registerForm = this.formBuilder.group({
      'firstname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'email': ['', Validators.compose([Validators.required, emailValidator])],
      'addresse': [''],
      'password': ['', Validators.required],
      'confirmPassword': ['', Validators.required]

      
    },{validator: matchingPasswords('password', 'confirmPassword')});

  }

  public onLoginFormSubmit(values:Object):void {
    console.log("values ::::::: ",values)
    console.log("values ::::::: ",values["email"])
    console.log("values ::::::: ",values["password"])
    if (values["email"] != '' && values["password"] != '') {
      // this.loading = true;
      this.authenticationService.login(this.formValues.email?.value, this.formValues.password?.value)
        .subscribe(
          async (data: any) => {
            console.log("data ::::::: ",data)
            let userInfo = await this.authenticationService.info(data.username);
            // this.loading = false;
            console.log("userInfo ::::::: ",userInfo)
            if (userInfo == null) {
              this.snackBar.open('Impossible de récuperer les informations du client, merci de réessayer à nouveau', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
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
      this.authenticationService.login(this.formValues.email?.value, this.formValues.password?.value)
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
    
    this.formValues.email.setValue("")
    this.formValues.password.setValue("")
    this.toSubmit = false;
  }

  

}
