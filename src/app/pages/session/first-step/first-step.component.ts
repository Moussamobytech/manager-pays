import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss']
})
export class SignInFirstStepComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  WhatsAppUs(action:string) {
    let message = (action=="Reseller")?"Bonjour, Je souhaiterais postuler pour devenir revendeur sur Fidelity Market.":"Bonjour, Je souhaiterais obtenir plus d'informations sur Fidelity Market.";
    const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
    window.open(link, "_blank");
  }

}
