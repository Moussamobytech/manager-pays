import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  defaultLogoUrl = 'assets/images/icons/user_icon.png';
  cards = [
    { icon: 'fas fa-sack-dollar', title: 'Mes gains', content: '20000F', routerLink: 'earnings', cardClass: 'amber' },
    { icon: 'fas fa-exchange-alt', title: 'Invite tes amis', content: 'Gagne jusqu\'à 5000 F par ami invité !', routerLink: '/referal', cardClass: 'primary' },
    { icon: 'fa-solid fa-phone', title: 'Mettre à jour', content: 'Mon numéro de téléphone', routerLink: 'settings', cardClass: 'primary' },
    { icon: 'fas fa-chart-line', title: 'Devenir revendeur', content: 'Gagner des commissions sur chaque vente !', cardClass: 'amber' },
  ];
  historiqueData = [
  { image: 'assets/images/ads/3.jpg', name: 'Chemise homme', price: '35 000F', status: 'Livrée', date: '05/02/2025', color: 'accent' },
  { image: 'assets/images/ads/1.jpg', name: 'Robe femme', price: '15 000F', status: 'En attente', date: '05/02/2025', color: 'amber' },
  { image: 'assets/images/ads/3.jpg', name: 'Sac à dos', price: '20 000F', status: 'Annulée', date: '05/02/2025', color: 'warn' },
  ];
  selectedLogo: File | null = null ;
  public currentUser:any = this.auth.currentUser();
  selectedTab = 'historique';
  favorisProducts:Product[] = [];
  user:any

  constructor(private auth : AuthenticationService, private imgCompressService:ImageCompressService,
    private cm:CommonService, private produitService:ProductService) { }

  async ngOnInit() {
    this.favorisProducts = await this.produitService.getProductByNewArrival(50)
    this.currentUser = this.auth.currentUser()
    this.user = this.currentUser;
    console.log("USER = ",this.user);

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

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  WhatsAppUs(card: string) {
    console.log(card);
    if(card.toLowerCase().includes("revendeur")){
      let message = "Bonjour, Je souhaiterais postuler pour devenir revendeur sur Fidelity Market.";
      const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
      window.open(link, "_blank");
    }
  }

}
