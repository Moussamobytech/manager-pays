import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm: UntypedFormGroup;
  selectedCountry: any;
  phoneMask: string = '00 00 00 00'; // Default mask for Mali

  countries = [
    { code: 'ML', name: 'Mali', phoneCode: '+223', placeholder: 'XX XX XX XX', mask: '00 00 00 00' },
    { code: 'CI', name: 'Côte d’Ivoire', phoneCode: '+225', placeholder: 'XX XX XX XXXX', mask: '00 00 00 0000' }
  ];

  constructor(
    private authenticationService: AuthenticationService,
    public formBuilder: UntypedFormBuilder,
    public router: Router,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authenticationService.logout();

    this.selectedCountry = this.countries.find(c => c.code === 'ML');

    this.loginForm = this.formBuilder.group({
      country: ['ML'],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get loginFormControls() { return this.loginForm.controls; }

  handleChange(event: any) {
    this.selectedCountry = this.countries.find(c => c.code === event.value);
    this.phoneMask = this.selectedCountry.mask;
    this.loginForm.controls['username'].setValue('');
  }

  public onLoginFormSubmit(values: any): void {
    if (this.loginForm.valid) {
      let phone = this.selectedCountry.phoneCode + values['username'];
      let pwd = values['password'];

      this.authenticationService.login(phone, pwd).subscribe(
        async (data: any) => {
          let userInfo = await this.authenticationService.info(data.username);
          if (!userInfo) {
            this.snackBar.open('Erreur de récupération des informations', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            return;
          }
          this.router.navigate(['/account-customer']);
        },
        () => {
          this.snackBar.open('Erreur de connexion, veuillez réessayer', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      );
    }
  }
}
