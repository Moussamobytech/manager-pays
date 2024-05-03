import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { emailValidator, matchingPasswords } from '../../../theme/utils/app-validators';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  infoForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  currentUser : User
  constructor(public formBuilder: UntypedFormBuilder, private auth : AuthenticationService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    this.infoForm = this.formBuilder.group({
      'firstname': [(this.currentUser.firstname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': [(this.currentUser.lastname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'phoneNumber': [this.currentUser.phoneNumber, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      'profiles': [this.currentUser.profiles || null],
      'adresse': [this.currentUser.adresse || null]
    });

    this.passwordForm = this.formBuilder.group({
      'currentPassword': ['', Validators.required],
      'newPassword': ['', Validators.required],
      'confirmNewPassword': ['', Validators.required]
    },{validator: matchingPasswords('newPassword', 'confirmNewPassword')});
  }

  public async onInfoFormSubmit(values:Object):Promise<void> {
    if (this.infoForm.valid) {
      let data : any = values;
      data.type = this.currentProfile(values["profiles"])
      let res = await this.auth.updateUserInfo(this.currentUser.id, data)
      if(res == "OK"){
        this.snackBar.open('Les informations de votre compte ont été mises à jour avec succès !', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        window.location.reload()
      }else{
        this.snackBar.open('Une erreur est intervenu lors de la mises à jour de vos informations !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }

  public async onPasswordFormSubmit(values:Object):Promise<void> {
    if (this.passwordForm.valid) {

      this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
    }
  }

  currentProfile(roles){
    console.log("roles :::::::: ",roles)
    let key = roles[0].name
    console.log("key :::::::: ",key)
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
}
