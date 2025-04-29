import { Component, OnInit } from '@angular/core';
import { CampagneService } from 'src/app/services/campagne.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthenticationService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.models';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {
  currentUser: User;
  benefits = [
    { 
      iconClass: 'fas fa-gift', 
      title: 'Tu Gagnes', 
      description: '5% de commission sur le premier achat de tes amis (jusqu\'à 5000 F).'
    },
    { 
      iconClass: 'fas fa-hand-holding-usd', 
      title: 'Tes Amis Gagnent', 
      description: 'Une réduction jusqu\'à 10% sur leur premier achat !'
    },
    { 
      iconClass: 'fas fa-eye', 
      title: 'Transparent', 
      description: 'Consulte tes gains en temps réel et transforme-les en cash ou réduction.'
    },
    { 
      iconClass: 'fas fa-bolt', 
      title: 'Simple et Rapide', 
      description: 'C\'est simple : partage et tout le monde gagne !'
    }
  ];
  parrainageCampaigns: any;
  isCopied = false;
  referalLink: string = "https://fidelity-market.com/#/products/promo";

 // sellerInfo: any = JSON.parse(sessionStorage.getItem('currentUser')!);
 // shopLink: string = window.location.origin + '/#/sellers/' + this.sellerInfo.username;

  constructor(
    private campagneService: CampagneService,
    private commonService: CommonMessageService,
    private clipboard: Clipboard,
    private authService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    this.loadParrainageCampaigns();
  }

  loadParrainageCampaigns() {
    this.campagneService.getAllCampagne().subscribe({
      next: (campaigns) => {
        // Filtrer les campagnes de parrainage actives
        this.parrainageCampaigns = campaigns.filter(campaign => 
          campaign.typePromo.name === 'PARRAINAGE' && 
          campaign.active &&
          new Date(campaign.dateFin) > new Date()
        );
       },
      error: (err) => {
        this.commonService.errorToast("Erreur lors du chargement des campagnes");
      }
    });
  }

  copyCode(code: string,user:string) {
   const link = window.location.origin + '/#/sellers/' + user+'/'+code;
    this.clipboard.copy(link);
    this.isCopied = true;
    this.commonService.successToast("Code copié dans le presse-papiers");
    setTimeout(() => {
      this.isCopied = false;
    }, 2000);
  }

  copyLink(inputElement: HTMLInputElement): void {
    inputElement.style.transition = '.3s';
    inputElement.select();
    navigator.clipboard.writeText(this.referalLink).then(
      () => {
        this.isCopied = true;
        setTimeout(() => (this.isCopied = false), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }

  shareOnWhatsApp(campaign: any) {
    const code = campaign.codePromoList[0].code;
    const message = `Rejoins-moi sur Fidelity Market ! Utilise mon code de parrainage ${code} pour obtenir une réduction de ${campaign.reduction}% sur ton premier achat.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  shareOnSocial(campaign: any) {
    
    const code = campaign.codePromoList[0].code;
    const link = window.location.origin + '/#/sellers/' +this.currentUser.username+'/'+code;

    const message = `Rejoins-moi sur Fidelity Market ! Utilise mon code de parrainage ${code} pour obtenir une réduction de ${link}% sur ton premier achat.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Fidelity Market - Parrainage',
        text: message,
        url: window.location.origin
      }).catch(console.error);
    } else {
      this.copyCode(code,this.currentUser.username);
      this.commonService.successToast("Message copié ! Partagez-le sur vos réseaux sociaux.");
    }
  }

  calculateRemainingDays(campaign: any): string {
    const today = new Date();
    const startDate = new Date(campaign.dateDebut);
    const endDate = new Date(campaign.dateFin);
    
    // Réinitialiser les heures pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    // Si la date de début n'est pas encore atteinte
    if (today < startDate) {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Débute dans ${daysUntilStart} jour${daysUntilStart > 1 ? 's' : ''}`;
    }
    
    // Si la date de fin est dépassée
    if (today > endDate) {
      return 'Expiré';
    }
    
    // Si c'est le dernier jour
    if (today.getTime() === endDate.getTime()) {
      return 'Dernier jour';
    }
    
    // Calculer les jours restants
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`;
  }

}
