import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { matchingPasswords } from '../../../theme/utils/app-validators';
import { AuthenticationService } from '../../../services/auth.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  clientForm: UntypedFormGroup;
  vendeurForm: UntypedFormGroup;
  loading: boolean = false;
  profil: string = 'client';
  selectedClientCountry: any;
  selectedVendeurCountry: any;
  phoneMask: string = '00 00 00 00';
  showSecondPage: boolean = false;
  public selectedFileName: string = '';
  countries = [
      { code: 'ML', name: 'Mali', phoneCode: '+223', placeholder: 'XX XX XX XX', mask: '00 00 00 00' },
      { code: 'CI', name: 'Côte d’Ivoire', phoneCode: '+225', placeholder: 'XX XX XX XXXX', mask: '00 00 00 0000' }
  ];
  selectedFile: File | null = null;
  hidePassword = true;
  hideConfirm = true;

  constructor(private authenticationService: AuthenticationService, public formBuilder: UntypedFormBuilder,
    public router: Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.selectedClientCountry = this.countries.find(c => c.code === 'ML');
    this.selectedVendeurCountry = this.countries.find(c => c.code === 'ML');

    this.clientForm = this.formBuilder.group({
      clientFirstName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      clientLastName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      clientCountry: ['ML'],
      clientPhone: ['', Validators.compose([Validators.required])]
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
      vendeurCountry: ['ML'],
      vendeurPhone: ['', [Validators.compose([Validators.required])]],
      vendeurPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
      confirmPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
    }, { validator: matchingPasswords('vendeurPassword', 'confirmPassword') });
  }

  get clientFormValues() { return this.clientForm.controls; }
  get vendeurFormValues() { return this.vendeurForm.controls; }

  profilType(value: string) {
    this.profil = value;
    this.showSecondPage = false;
    if(value=='client') {
      this.clientForm.reset({
        clientCountry: 'ML',
      });
    }else {
      this.vendeurForm.reset({
        vendeurCountry: 'ML',
      });
    }
  }

  handleClientCountryChange(event: any) {
    this.selectedClientCountry = this.countries.find(c => c.code === event.value);
  }

  handleVendeurCountryChange(event: any) {
    this.selectedVendeurCountry = this.countries.find(c => c.code === event.value);
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.selectedFileName = (this.selectedFile.name.length>16) ? this.selectedFile.name.substring(0,12)+'...'+this.selectedFile.name.substring(this.selectedFile.name.length-4) : this.selectedFile.name;
    }
  }

  public async onClientFormSubmit(values: any): Promise<void> {
    try {
      if (this.clientForm.valid) {
        // Client form submission logic
        console.log('Client form values:', values);
      }
    } catch (error: any) {
      console.error('Error submitting client form:', error);
    }
  }

  public async onVendeurFormSubmit(values: any): Promise<void> {
    try {
      if (this.vendeurForm.valid) {
        // Vendeur form submission logic
        console.log('Vendeur form values:', values);
      }
    } catch (error: any) {
      console.error('Error submitting vendeur form:', error);
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
