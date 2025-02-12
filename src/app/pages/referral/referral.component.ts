import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {
  benefits = [
    { iconClass: 'fas fa-gift', title: 'Tu Gagnes', description: '5 % de commission sur le premier achat de tes amis (jusqu’à 5000 F).', },
    { iconClass: 'fas fa-hand-holding-usd', title: 'Tes Amis Gagnent', description: 'Une réduction jusqu’à 10 % sur leur premier achat !', },
    { iconClass: 'fas fa-eye', title: 'Transparent', description: 'Consulte tes gains en temps réel et transforme-les en cash ou réduction.', },
    { iconClass: 'fas fa-bolt', title: 'Simple et Rapide', description: 'C’est simple : partage et tout le monde gagne !', },
  ];
  isCopied: boolean;
  referalLink: string = "https://fidelity-market.com/#/products/promo";

  constructor() { }

  ngOnInit() {
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

}
