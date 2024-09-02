import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AuthenticationService } from '../../services/auth.service';
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
  countries : any[] = [{id : "mali", nom: "Mali"}, {id:"civ", nom:"Côte d'ivoire"}];
  mask = '00 00 00 00'
  maskPlaceholder = 'XX XX XX XX'
  selectedFile: File | null = null;

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder,
    public router:Router, public snackBar: MatSnackBar) { }

  ngOnInit() {

    this.registerForm = this.formBuilder.group({
      'firstname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      // 'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      // 'email': ['', Validators.compose([Validators.required, emailValidator])],
      'email': [null],
      'addresse': [null],
      'country': ['mali'],
      'state': [null],
      'rccm': [null],
      'boutique': [null],
      'logo': [''],
      'phone': ['', Validators.compose([Validators.required])],
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
            this.router.navigate(["/sign-in"]);
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
  reset($event : Event){
    console.log("resetting process ::::::::");

    this.formValues.email.setValue("")
    this.formValues.password.setValue("")
    this.toSubmit = false;
  }
  // onFileSelected(event: Event): void {
  //   const fileInput = event.target as HTMLInputElement;
  //   if (fileInput.files && fileInput.files.length > 0) {
  //     this.selectedFile = fileInput.files[0];
  //   }
  // }
  public async onRegisterFormSubmit1(values:Object):Promise<void> {
    console.log("values :::::::: ", this.registerForm.value);
    console.log("values :::::::: ", this.registerForm.valid);

    try {
      if (this.registerForm.valid) {
        const values = this.registerForm.value;

        // Création de l'objet FormData
        const formData = new FormData();
        formData.append('username', ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone']);
        formData.append('firstname', values["firstname"]);
        formData.append('lastname', values["lastname"]);
        formData.append('password', values["password"]);
        formData.append('phoneNumber', values["phone"]);
        formData.append('addresse', values["addresse"]);
        formData.append('country', values['country']);
        formData.append('state', values['state']);
        formData.append('rccm', values['rccm']);
        formData.append('boutique', values['boutique']);
        formData.append('email', values["email"]);
        formData.append('role', this.profil);
        formData.append('typeOfUsername', 'phone');

        // Ajout du logo si un fichier a été sélectionné
        if (this.selectedFile) {
          formData.append('logo', this.selectedFile);
        }

        // Envoi du FormData avec l'image et les autres données du formulaire
        this.authenticationService.signup(formData).toPromise()
          .then((res: any) => {
            console.log("res :::::::: ", res);
            this.snackBar.open(res.message || 'Votre compte a été créé avec succès!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
            this.router.navigate(["/sign-in"]);
          })
          .catch((error: any) => {
            console.log(error);
            this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          });

      }
    } catch (error: any) {
      console.log(error);
      this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    }
  }


  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  public async onRegisterFormSubmit(values:Object):Promise<void> {
    console.log("values :::::::: ",values)
    console.log("values :::::::: ",this.registerForm.valid)
    try {
      if (this.registerForm.valid) {
        let formData = {
          username: ("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone'],
          firstname: values["firstname"],
          lastname: values["lastname"],
          password: values["password"],
          phoneNumber: values["phone"],
          addresse: values["addresse"],
          country: values['country'],
          state: values['state'],
          rccm: values['rccm'],
          boutique: values['boutique'],
          logo: values['logo'],
          email: values["email"],
          role: [this.profil],
          typeOfUsername: 'phone'

          // typeOfUsername: validateEmail(values["email"]) ? 'email' : 'phone',
        };
        let res = await this.authenticationService.signup(formData).toPromise();
        console.log("res :::::::: ",res)
        this.snackBar.open(res.message || 'Votre compte a été crée avec succès!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        // Ajout du logo si un fichier a été sélectionné
        if (this.selectedFile) {
          this.authenticationService.uploadImange(("mali" == values["country"]) ? "223"+ values['phone'] : "225"+ values['phone'],this.selectedFile)
        }
        this.router.navigate(["/sign-in"]);
      }
    } catch (error : any) {
      console.log(error)
      this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    }

  }

}
