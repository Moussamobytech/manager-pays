import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/auth.service';
import { matchingPasswords } from '../../../theme/utils/app-validators';
import { CountryService } from 'src/app/services/country.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  @ViewChild('updatePasse') updatePasse: TemplateRef<any>;

  settingForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;

  selectedCountry: any;
  phoneMask: string = '00 00 00 00'; // Default mask for Mali
  hideOldPasse = true;
  hidePassword = true;
  hideConfirm = true;
  countries: any
  /*countries = [
    { code: 'ML', name: 'Mali', phoneCode: '+223', placeholder: 'XX XX XX XX', mask: '00 00 00 00' },
    { code: 'CI', name: 'Côte d'Ivoire', phoneCode: '+225', placeholder: 'XX XX XX XXXX', mask: '00 00 00 0000' }
  ];*/
  currentUser: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private authenticationService: AuthenticationService,
    public formBuilder: UntypedFormBuilder,
    private countryService: CountryService,
    private auth: AuthenticationService,) { }

  ngOnInit() {

    this.currentUser = this.auth.currentUser()
    this.getAllPays();

    console.log("1111 === this.currentUser :::: ", this.currentUser);
   // let cur = this.currentUser;
    //   this.selectedCountry = this.countries.find(c => c.code === 'ML');

    this.settingForm = this.formBuilder.group({
      firstname: [(this.currentUser.firstname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      lastname: [(this.currentUser.lastname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      country: [(this.currentUser.countries.id || null),],
      phoneNumber: [(this.currentUser.phoneNumber || null),Validators.required],
      username: [(this.currentUser.phoneNumber || null),],
      profiles: [this.currentUser.profiles || null],
      boutiqueName: [this.currentUser.name || null],
      adresse: [this.currentUser.adresse || null],
      email: [(this.currentUser.email || null), Validators.pattern(/^[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
      description: [this.currentUser.description || null],

    });

    this.passwordForm = this.formBuilder.group({
      oldPasse: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
      password: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
      confirmPassword: ['', [Validators.compose([Validators.required, Validators.minLength(6)])]],
    }, {
      validator: matchingPasswords('password', 'confirmPassword')
    })

  }

  get settingFormControls() { return this.settingForm.controls; }
  get paaseFormControls() { return this.passwordForm.controls; }

  public async onSettingFormSubmit(values: any) {
    if (this.settingForm.valid) {
        let data = {
            firstname: values.firstname,
            lastname: values.lastname,
            phoneNumber: values.phoneNumber,
            email: values.email,
            adresse: values.adresse,
            nom: values.boutiqueName,
            type: this.currentProfile(values.profiles),
            idCountry: values.country,
        };
        let res = await this.auth.updateUserInfo(this.currentUser.id, data);
        if (res == "OK") {
            this.snackBar.open('Les informations de votre compte ont été mises à jour avec succès !', '×', {
                panelClass: 'success', verticalPosition: 'top', duration: 3000
            });
            // Mettre à jour les informations de l'utilisateur
            this.currentUser = await this.auth.info(this.currentUser.username);
            // Mettre à jour le formulaire avec les nouvelles données
            this.settingForm.patchValue({
                firstname: this.currentUser.firstname,
                lastname: this.currentUser.lastname,
                country: this.currentUser.countries.id,
                phoneNumber: this.currentUser.phoneNumber,
                username: this.currentUser.phoneNumber,
                profiles: this.currentUser.profiles,
                boutiqueName: this.currentUser.name,
                adresse: this.currentUser.adresse,
                email: this.currentUser.email,
                description: this.currentUser.description
            });

            window.location.reload();
        } else {
            this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations !', '×', {
                panelClass: 'error', verticalPosition: 'top', duration: 3000
            });
        }
    }
}


  //::::::::::::::::::::::::::::   UPDATE PASSWORD
  public async updatePasses() {
    if (this.passwordForm.valid) {
      let data: any = {
        username: this.currentUser.username,
        password: this.passwordForm.value.oldPasse,
        newpassword: this.passwordForm.value.confirmPassword
      };

      try {
        let res: any = await this.auth.updatePassword(data);
        if (res === "OK") {
          this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          this.dialog.closeAll()
        } else {
          this.snackBar.open(res.message || 'Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      } catch (error: any) {
        this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }

  getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })
  }

  handleCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedCountry = datas

      // Définir le masque en fonction du pays sélectionné
      let phoneLength = this.getPhoneLength(datas.nom); // Récupérer la longueur du numéro
      this.phoneMask = '0'.repeat(phoneLength); // Génère un masque comme "000000000"

      // Réinitialiser le champ de téléphone
      this.settingForm.controls['phoneNumber'].setValue('');


    })
  }
  onNoClick(): void {
    this.dialog.closeAll();
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.updatePasse, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Reset form fields after the dialog is closed
      this.passwordForm.reset({
        oldPasse: '',
        password: '',
        confirmPassword: ''

      });

      // Navigate to the desired route
      this.router.navigate(['/account-customer/settings']);
    });
  }

  currentProfile(roles){
    let key = roles[0].name
    let profil = ""
    switch (key) {
      case "ROLE_PARTICULIER":
        profil = "particulier"
        break;
      case "ROLE_BOUTIQUE":
        profil = "Boutique"
        break
      case "ROLE_ADMIN":
        profil = "Administrateur"
        break;
      case "ROLE_USER":
        profil = "Utilisateur"
        break;

      default:
        profil = "N/A"
        break;
    }
    return profil
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
}
