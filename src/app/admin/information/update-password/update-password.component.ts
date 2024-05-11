import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/models/user.models';
import { matchingPasswords } from 'src/app/theme/utils/app-validators';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent implements OnInit {
  infoForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  currentUser : User
  constructor(public formBuilder: UntypedFormBuilder, private auth : AuthenticationService, public snackBar: MatSnackBar) { }


  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    this.infoForm = this.formBuilder.group({
      'firstname': [(this.currentUser.firstname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': [(this.currentUser.lastname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'username': [(this.currentUser.username || null), Validators.compose([Validators.required, Validators.minLength(8)])],
      'phoneNumber': [this.currentUser.phoneNumber, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      'profiles': [this.currentUser.profiles || null],
      'adresse': [this.currentUser.adresse || null]
    });

    this.passwordForm = this.formBuilder.group({
      'currentPassword': ['', Validators.required],
      'newPassword': ['', Validators.required],
      'confirmNewPassword': ['', Validators.required],
      // 'phoneNumber': [this.currentUser.phoneNumber, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      'username': [this.currentUser.username , Validators.required]
    },{validator: matchingPasswords('newPassword', 'confirmNewPassword')});
  }

  public async onPasswordFormSubmit(values: Object): Promise<void> {
    if (this.passwordForm.valid && this.passwordForm.value.newPassword) {
      let data: any = {
        username: this.passwordForm.value.username,
        password: this.passwordForm.value.currentPassword,
        newpassword: this.passwordForm.value.newPassword
      };

      try {
        let res: any = await this.auth.updatePassword(data);
        console.log("Response:", res);
        if (res === "OK") {
          this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          window.location.reload();
        } else {
          this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      } catch (error: any) {
        console.log("Error:", error);
        this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }


}
