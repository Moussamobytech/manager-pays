import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  WhatsAppUs(action:string) {
    let message = (action=="Reseller")?"Bonjour, Je souhaiterais postuler pour devenir revendeur sur Fidelity Market.":"Bonjour, Je souhaiterais obtenir plus d'informations sur Fidelity Market.";
    const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
    window.open(link, "_blank");
  }

}

