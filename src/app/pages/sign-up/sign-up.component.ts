import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthenticationService } from 'src/app/service/auth.service';
import { validateEmail } from 'src/app/helpers';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  
  registerForm: UntypedFormGroup;
  formSubmitted: boolean = false;
  toSubmit: boolean = false;
  loading: boolean = false;
  profil : string = null;

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder, 
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    
    this.registerForm = this.formBuilder.group({
      'firstname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      // 'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      // 'email': ['', Validators.compose([Validators.required, emailValidator])],
      'email': ['', Validators.compose([Validators.required])],
      'addresse': [''],
      'phone': ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]

    },{validator: matchingPasswords('password', 'confirmPassword')});

  }

  /**
   * convenience getter for easy access to form fields
  */
  get formValues() { return this.registerForm.controls; }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      this.loading = true;
      this.authenticationService.login(this.formValues.email?.value, this.formValues.password?.value)
        .subscribe(
          (data: any) => {
            this.router.navigate([""]);
          },
          (error: any) => {
            console.log(error);
            this.loading = false;
          });
    }
  }

  profilType(value){
    this.profil = value
  }

  reset($event : Event){
    console.log("resetting process ::::::::");
    
    this.formValues.email.setValue("")
    this.formValues.password.setValue("")
    this.toSubmit = false;
  }

  public async onRegisterFormSubmit(values:Object):Promise<void> {
    console.log("values :::::::: ",values)
    console.log("values :::::::: ",this.registerForm.valid)
    try {
      if (this.registerForm.valid) {
        let formData = {
          username: values["email"],
          firstname: values["firstname"],
          lastname: values["lastname"],
          password: values["password"],
          phoneNumber: values["phone"],
          addresse: values["addresse"],
          email: values["email"],
          role: [this.profil],
          typeOfUsername: 'email'
          // typeOfUsername: validateEmail(values["username"]) ? 'email' : 'phone',
        };
        let res = await this.authenticationService.signup(formData).toPromise();
        console.log("res :::::::: ",res)
        this.snackBar.open(res.message || 'Votre compte a été crée avec succès!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(["/sign-in"]);
      }
    } catch (error) {
      console.log(error)
      this.snackBar.open('Une erreur s\'est produite lors de la création du compte !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    }
    
  }

}
