import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { matchingPasswords } from '../../../theme/utils/app-validators';
import { AuthenticationService } from '../../../services/auth.service';
import { CountryService } from 'src/app/services/country.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  clientForm: UntypedFormGroup;
  vendeurForm: UntypedFormGroup;
  loading: boolean = false;
  profil: string = 'particulier';
  selectedClientCountry: any;
  selectedVendeurCountry: any;
  phoneMask: string = '00 00 00 00';
  showSecondPage: boolean = false;
  public selectedFileName: string = '';
  countries: any
  /*countries = [
      { code: 'ML', name: 'Mali', phoneCode: '+223', placeholder: 'XX XX XX XX', mask: '00 00 00 00' },
      { code: 'CI', name: 'Côte d’Ivoire', phoneCode: '+225', placeholder: 'XX XX XX XXXX', mask: '00 00 00 0000' }
  ];
  */
  selectedFile: File | null = null;
  hidePassword = true;
  hideConfirm = true;

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder,
    public router: Router, public snackBar: MatSnackBar, private countryService: CountryService,
  ) { }

  ngOnInit() {
    this.getAllPays();

    //    this.selectedClientCountry = this.countries.find(c => c.indicatif === '223');
    //this.selectedVendeurCountry = this.countries.find(c => c.code === 'ML');

    this.clientForm = this.formBuilder.group({
      clientFirstName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      clientLastName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      clientCountry: ['', Validators.required],
      clientPhone: ['', Validators.compose([Validators.required])],
      clientPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
      clientConfirmPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
    }, {
      validator: matchingPasswords('clientPassword', 'clientConfirmPassword')
    });

    this.vendeurForm = this.formBuilder.group({
      vendeurFirstName: ['', [Validators.compose([Validators.required, Validators.minLength(3)])]],
      vendeurLastName: ['', [Validators.compose([Validators.required, Validators.minLength(3)])]],
      hasBoutique: [false],
      boutiqueName: [''],
      isGrossiste: [false],
      isRetailer: [false],
      isReseller: [false],
      logo: [''],
      vendeurCountry: ['', Validators.required],
      vendeurPhone: ['', [Validators.compose([Validators.required])]],
      vendeurPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
      confirmPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
    }, { validator: matchingPasswords('vendeurPassword', 'confirmPassword') });
  }





  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })

  }

  getCountryById(id) {
    this.countryService.getById(id).subscribe(datas => {
    })

  }

  get clientFormValues() { return this.clientForm.controls; }
  get vendeurFormValues() { return this.vendeurForm.controls; }

  profilType(value: string) {
    this.profil = value;
    this.showSecondPage = false;
    if (value == 'particulier') {
      this.clientForm.reset({
        clientCountry: 'ML',
      });
    } else {
      this.vendeurForm.reset({
        vendeurCountry: 'ML',
      });
    }
  }

  handleClientCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedClientCountry = datas

        // Définir le masque en fonction du pays sélectionné
        let phoneLength = this.getPhoneLength(datas.nom); // Récupérer la longueur du numéro
        this.phoneMask = '0'.repeat(phoneLength); // Génère un masque comme "000000000"
        
        // Réinitialiser le champ de téléphone
        this.clientForm.controls['username'].setValue('');


    })
  }

  handleVendeurCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedVendeurCountry = datas

       // Définir le masque en fonction du pays sélectionné
       let phoneLength = this.getPhoneLength(datas.nom); // Récupérer la longueur du numéro
       this.phoneMask = '0'.repeat(phoneLength); // Génère un masque comme "000000000"
       
       // Réinitialiser le champ de téléphone
       this.vendeurForm.controls['username'].setValue('');
    })
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

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.selectedFileName = (this.selectedFile.name.length > 16) ? this.selectedFile.name.substring(0, 12) + '...' + this.selectedFile.name.substring(this.selectedFile.name.length - 4) : this.selectedFile.name;
    }
  }

  public async onClientFormSubmit(values: any): Promise<void> {
    try {
      if (this.clientForm.valid) {
        const formData = new FormData();
        formData.append('firstname', this.clientForm.value.clientFirstName);
        formData.append('lastname', this.clientForm.value.clientLastName);
        formData.append('countries', this.clientForm.value.clientCountry);
        formData.append('phoneNumber', this.clientForm.value.clientPhone);
        formData.append('username', this.selectedClientCountry.indicatif+this.clientForm.value.clientPhone);
        formData.append('role', this.profil);
        formData.append('password', this.clientForm.value.clientConfirmPassword);
        formData.append('typeOfUsername', 'phone');

        let res = await this.authenticationService.signup(formData).toPromise();

        this.snackBar.open(res.message || 'Votre compte a été crée avec succès! 2', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.router.navigate(["/authentication/sign-in"]);

      }
    } catch (error: any) {
      this.snackBar.open('Une erreur s\'est produite', '×', { panelClass: 'warning', verticalPosition: 'top', duration: 3000 });
    }
  }

  public async onVendeurFormSubmit(): Promise<void> {
    try {
      if (this.vendeurForm.valid) {
        const formData = new FormData();
        formData.append('firstname', this.vendeurForm.value.vendeurFirstName);
        formData.append('lastname', this.vendeurForm.value.vendeurLastName);
        formData.append('boutique', this.vendeurForm.value.boutiqueName);
        formData.append('countries', this.vendeurForm.value.vendeurCountry);
        formData.append('phoneNumber', this.vendeurForm.value.vendeurPhone);
        formData.append('username', this.selectedVendeurCountry.indicatif+this.vendeurForm.value.vendeurPhone);
        formData.append('role', this.profil);
        formData.append('password', this.vendeurForm.value.confirmPassword);
        formData.append('typeOfUsername', 'phone');

        // Vérifier si un fichier a été sélectionné avant de l'ajouter
        if (this.selectedFile) {
          formData.append('logo', this.selectedFile);
        }
        // Envoyer la requête avec FormData
        let res = await this.authenticationService.signup(formData).toPromise();

        this.snackBar.open(res.message || 'Votre compte a été créé avec succès !', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.router.navigate(["/authentication/sign-in"]);

      }
    } catch (error: any) {
      this.snackBar.open('Une erreur s\'est produite', '×', { panelClass: 'warning', verticalPosition: 'top', duration: 3000 });
    }
  }


  nextPage() {
    this.showSecondPage = true;
  }

  previousPage() {
    this.showSecondPage = false;
  }

  // onBoutiqueChange(event: MatRadioChange) {
  //   this.showBoutiqueFields = event.value === 'true';
  //   if (!this.showBoutiqueFields) {
  //     this.vendeurForm.patchValue({
  //       boutiqueName: '',
  //       isGrossiste: false,
  //       isRetailer: false,
  //       isReseller: false
  //     });
  //   }
  // }
}


// Old submit Method

// public async onRegisterFormSubmit(values: any): Promise<void> {
//   try {
//     if (this.registerForm.valid) {
//       let formData = {
//         username: ("mali" == values["country"]) ? "223" + values['phone'] : "225" + values['phone'],
//         firstname: values["firstname"],
//         lastname: values["lastname"],
//         password: values["password"],
//         phoneNumber: values["phone"],
//         addresse: values["addresse"],
//         country: values['country'],
//         state: values['state'],
//         code: values['code'],
//         rccm: values['rccm'],
//         boutique: values['boutique'],
//         logo: values['logo'],
//         email: values["email"],
//         role: [this.profil],
//         typeOfUsername: 'phone'
//       };
//       let res = await this.authenticationService.signup(formData).toPromise();
//       this.snackBar.open(res.message || 'Votre compte a été crée avec succès!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
//       if (this.selectedFile) {
//         this.authenticationService.uploadImange(("mali" == values["country"]) ? "223" + values['phone'] : "225" + values['phone'], this.selectedFile)
//       }
//       this.router.navigate(["/sign-in"]);
//     }
//   } catch (error: any) {
//     console.log(error)
//     this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
//   }
// }
