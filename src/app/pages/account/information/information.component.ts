import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {  matchingPasswords } from '../../../theme/utils/app-validators';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  infoForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  currentUser : User
  hide = true;
  hide1 = true;
  hide2 = true;
  wordCount: number = 0;
  maxWords: number = 70;
  imgLink: string = "https://image.geotrac.io/minio/api/v1/view?bucket=ecommerce-bucket&file=";
  constructor(public formBuilder: UntypedFormBuilder,
    private auth : AuthenticationService,
    public snackBar: MatSnackBar,
    private imgCompressService:ImageCompressService,
    private cm:CommonService,
  ) { }
  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    let cur = this.currentUser;
    let bgs = [cur.bg1, cur.bg2, cur.bg3];
    const curBanners: any[] = bgs.filter(item => item).map(item => ({ preview: this.imgLink+item })); // i filter, remove null values then push the rewsult in curBaner
    console.log("currentUser :::: ",this.currentUser)

    this.infoForm = this.formBuilder.group({
      'firstname': [(cur.firstname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'lastname': [(cur.lastname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      'phoneNumber': [cur.phoneNumber, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      'profiles': [cur.profiles || null],
      'boutiqueName': [cur.name || null],
      'adresse': [cur.adresse || null],
      ////////////////////////////////////////////////
      'email': [(cur.email || null), Validators.pattern(/^[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
      'description': [cur.description || null],
      'banners': [curBanners|| null],
    });
    this.passwordForm = this.formBuilder.group({
      'currentPassword': ['', Validators.required],
      'newPassword': ['', Validators.required],
      'confirmNewPassword': ['', Validators.required],
    },{validator: [matchingPasswords('newPassword', 'confirmNewPassword')]});
  }

  public async onInfoFormSubmit(values:any):Promise<void> {
    if (this.infoForm.valid) {
      let banners: { bg1: File | null; bg2: File | null; bg3: File | null } = { bg1: null, bg2: null, bg3: null };
      await this.compressAndPrepareImages().then((compressedFiles) => {
        compressedFiles.forEach((file,i) => {banners["bg"+(i+1)] = file});
      });
      if(this.wordCount == this.maxWords){
        this.cm.openFailureSnackBar("La description ne doit pas depasser 70 mots.")
      }

      let data = new FormData();
      data.append('firstname', values.firstname);
      data.append('lastname', values.lastname);
      data.append('phoneNumber', values.phoneNumber);
      data.append('email', values.email);
      data.append('adresse', values.adresse);
      data.append('nom', values.boutiqueName);
      data.append('description', values.description);
      if (banners.bg1) data.append('bg1', banners.bg1);
      if (banners.bg2) data.append('bg2', banners.bg2);
      if (banners.bg3) data.append('bg3', banners.bg3);
      data.append('type', this.currentProfile(values.profiles));
      console.log("data: ",data);
      let res = await this.auth.updateUserInfo(this.currentUser.id, data)
      if(res == "OK"){
        this.snackBar.open('Les informations de votre compte ont été mises à jour avec succès !', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
        this.currentUser = await this.auth.info(this.currentUser.username);// update user info
        console.log(this.currentUser);
      }else{
        this.snackBar.open('Une erreur est intervenu lors de la mises à jour de vos informations !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }

  public async onPasswordFormSubmit(values: Object): Promise<void> {
    if (this.passwordForm.valid && this.passwordForm.value.newPassword) {
      let data: any = {
        username: this.currentUser.username,
        password: this.passwordForm.value.currentPassword,
        newpassword: this.passwordForm.value.newPassword
      };

      try {
        let res: any = await this.auth.updatePassword(data);
        console.log("Response:", res);
        if (res === "OK") {
          this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          // window.location.reload();
        } else {
          this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      } catch (error: any) {
        console.log("Error:", error);
        this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
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

  compressAndPrepareImages () {
    const compressedImagePromises = this.infoForm.value.banners.map(async (item: any) => {
      if(item.file){
        // const compressedBlob = await this.imgCompressService.compressImage(item.file, 1200, 800, 0.7);
        // const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
        // const compressedFile = new File([compressedBlob], randomName, { type: compressedBlob.type });
        return item.file;
      }else{
        let compressedFile = await this.convertUrlToFile(item.preview);
        return compressedFile;
      }
    });
    return Promise.all(compressedImagePromises);
  }

  updateDescriptionWordCount(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  }

  onDescriptionInput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    const words = value.trim().split(/\s+/);
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (words.length >= this.maxWords && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  async convertUrlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "converted.jpeg", { type: blob.type });
    return file;
  }
}
