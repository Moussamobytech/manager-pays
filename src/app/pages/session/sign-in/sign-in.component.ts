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
      .map(country => ({
        ...country,
        mask: '0'.repeat(this.getPhoneLength(country.nom)),
        indicatif: `+${country.indicatif}`,
      }));
      this.selectedCountry = this.countries.find(c => c.nom === 'Mali');
      this.loginForm.controls['country'].setValue(this.selectedCountry?.id);
    })
  }

  get loginFormControls() { return this.loginForm.controls; }

  handleChange(event: any) {
    this.selectedCountry = this.countries.find(c => c.id === event.value);
    console.log(this.selectedCountry);
    this.loginForm.controls['username'].setValue('');
  }



   getPhoneLength(countryName: string): number {
    const countryMap: { names: string[]; length: number }[] = [
      { names: ["bénin", "benin"], length: 8 },
      { names: ["burkina faso", "bourkina faso", "burkina"], length: 8 },
      { names: ["cap-vert", "cap vert"], length: 7 },
      { names: ["côte d'ivoire", "cote d'ivoire", "ivoire"], length: 10 },
      { names: ["gambie"], length: 7 },
      { names: ["ghana", "gana"], length: 9 },
      { names: ["guinée", "guinee"], length: 9 },
      { names: ["guinée-bissau", "guinée bissau", "bissau"], length: 7 },
      { names: ["libéria", "liberia"], length: 9 },
      { names: ["mali", "malie", "malin"], length: 8 },
      { names: ["niger", "nigér"], length: 8 },
      { names: ["nigeria", "nigéria"], length: 10 },
      { names: ["sénégal", "senegal"], length: 9 },
      { names: ["sierra leone", "leone"], length: 8 },
      { names: ["togo"], length: 8 },
      { names: ["tchad"], length: 8 },
      { names: ["tunisie", "tunis"], length: 8 },
      { names: ["zambie"], length: 9 },
      { names: ["zimbabwe"], length: 9 },
      { names: ["afrique du sud", "afrique sud", "sud afrique"], length: 9 },
      { names: ["botswana"], length: 9 },
      { names: ["burundi"], length: 9 },
      { names: ["cameroon", "cameroun"], length: 9 },
      { names: ["central african republic", "république centrafricaine"], length: 9 },
      { names: ["congo"], length: 9 },
    ];
  
    const normalizedInput = countryName.trim().toLowerCase();
  
    for (const entry of countryMap) {
      if (entry.names.some(name => name.toLowerCase() === normalizedInput)) {
        return entry.length;
      }
    }
  
    return 9; // Valeur par défaut
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
  WhatsAppUs() {    
      let message = "Bonjour, J'ai oublié mon mot de passe et je ne sais pas comment le réinitialiser. Pouvez-vous m'aider ?";
      const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
      window.open(link, "_blank");
  }
}
