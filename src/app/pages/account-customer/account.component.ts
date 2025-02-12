import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  defaultLogoUrl = 'assets/images/icons/user_icon.png';
  historiqueData = [
  { image: 'assets/images/ads/3.jpg', name: 'Chemise homme', price: '35 000F', status: 'Livrée', date: '05/02/2025', color: 'accent' },
  { image: 'assets/images/ads/1.jpg', name: 'Robe femme', price: '15 000F', status: 'En attente', date: '05/02/2025', color: 'amber' },
  { image: 'assets/images/ads/3.jpg', name: 'Sac à dos', price: '20 000F', status: 'Annulée', date: '05/02/2025', color: 'warn' },
  ];
  selectedLogo: File | null = null ;
  public currentUser:any = this.auth.currentUser();

  constructor(private auth : AuthenticationService, private imgCompressService:ImageCompressService,
    private cm:CommonService,) { }

  ngOnInit() {
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = (input.files[0]);
      let logoName = this.selectedLogo.name;
      try{
        let logo: File = this.selectedLogo;
        let isFileAllowed:boolean = logo.type.includes("image/")
        // Ajout du logo
        if(isFileAllowed){
          if (logo) {
            this.imgCompressService.compressImage(logo,1200,1000,70).then( async (Bloblogo) => {
              // I must convert blob type to File first
              const randomName = `logo-${Math.random().toString(36).substring(2, 15)}.jpeg`;
              let editedLogo = new File([Bloblogo], randomName, { type: Bloblogo.type });

              await this.auth.uploadImange(this.currentUser.username,editedLogo).toPromise();
              this.currentUser = await this.auth.info(this.currentUser.username);
              this.selectedLogo = null;
            });
          }
        }else{
          this.cm.openFailureSnackBar("Format incorrect, veillez choisir une image!");
        }
      }catch(error:any){
        console.log(error);
      }
    }
  }

}
