import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  loginForm: UntypedFormGroup;
  selectedCountry: any;
  hidePassword = true;
  countries:any

  constructor(
    private authenticationService: AuthenticationService,
    public formBuilder: UntypedFormBuilder,
    public router: Router,
    private cm:CommonService,private countryService: CountryService,
  ) {}

  ngOnInit() {
    this.authenticationService.logout();
  //  this.selectedCountry = this.countries.find(c => c.code === 'ML');

    this.loginForm = this.formBuilder.group({
      country: [''],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.getAllPays();

  }

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(country => ({...country, mask: this.getPhoneMask(country.nom)}));
      console.log(this.countries);
      this.selectedCountry = this.countries.find(c => c.nom === 'Mali');
      this.loginForm.controls['country'].setValue(this.selectedCountry.id);
    })
  }

  get loginFormControls() { return this.loginForm.controls; }

  handleChange(event: any) {
    this.selectedCountry = this.countries.find(c => c.id === event.value);
    console.log(this.selectedCountry);
    this.loginForm.controls['username'].setValue('');
  }



  getPhoneMask(countryName: string): number {
    const phoneLengths = {
      "Bénin": "00 00 00 00",
      "Burkina Faso": "00 00 00 00",
      "Cap-Vert": "000 0000",
      "Cote d'ivoire": "00 00 00 0000",
      "Gambie": "000 0000",
      "Ghana": "00 00 00 000",
      "Guinée": "00 00 00 000",
      "Guinée-Bissau": "000 0000",
      "Libéria": "00 00 00 000",
      "Mali": "00 00 00 00",
      "Niger": "00 00 00 00",
      "Nigeria": "00 00 00 0000",
      "Sénégal": "00 00 00 000",
      "Sierra Leone": "00 00 00 00",
      "Togo": "00 00 00 00"
    };

    return phoneLengths[countryName] || 9; // Par défaut, retourne 9 si le pays n'est pas trouvé
  }



  public onLoginFormSubmit(values: any): void {
    if (this.loginForm.valid) {
      let phone = this.selectedCountry.indicatif + values['username'];
      let pwd = values['password'];
      this.authenticationService.login(phone, pwd).subscribe(
        async (data: any) => {
          let userInfo = await this.authenticationService.info(data.username);
          if (!userInfo) {
            this.cm.openFailureSnackBar('Une erreur est survenue, veuillez réessayer');
            return;
          }
          (userInfo.profiles[0].name.toLowerCase().includes('boutique'))?
          this.router.navigate(['/account-seller/dashboard']) : this.router.navigate(['/account-customer']);
        },
        () => {
          this.cm.openFailureSnackBar('Numéro de telephone ou mot de passe incorrect');
        }
      );
    }
  }
}
