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
  phoneMask: string = '00 00 00 00';
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
      country: ['ML'],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.getAllPays();

  }

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }

  get loginFormControls() { return this.loginForm.controls; }

  handleChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedCountry = datas;
  
      // Définir le masque en fonction du pays sélectionné
      let phoneLength = this.getPhoneLength(datas.nom); // Récupérer la longueur du numéro
      this.phoneMask = '0'.repeat(phoneLength); // Génère un masque comme "000000000"
      
      // Réinitialiser le champ de téléphone
      this.loginForm.controls['username'].setValue('');
    });
  }
  


  getPhoneLength(countryName: string): number {
    const phoneLengths: { [key: string]: number } = {
      "Bénin": 8,
      "Burkina Faso": 8,
      "Cap-Vert": 7,
      "Côte d'Ivoire": 10,
      "Gambie": 7,
      "Ghana": 9,
      "Guinée": 9,
      "Guinée-Bissau": 7,
      "Libéria": 9,
      "Mali": 8,
      "Niger": 8,
      "Nigeria": 10,
      "Sénégal": 9,
      "Sierra Leone": 8,
      "Togo": 8
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
