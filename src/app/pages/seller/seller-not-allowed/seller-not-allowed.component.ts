import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomHandlerService } from 'src/app/dom-handler.service';

@Component({
  selector: 'app-seller-not-allowed',
  templateUrl: './seller-not-allowed.component.html',
  styleUrls: ['./seller-not-allowed.component.scss']
})
export class SellerNotAllowedComponent implements OnInit {
  isMobile:boolean
  constructor(private router:Router,private domHandlerService:DomHandlerService) { }

  ngOnInit() {
    this.isMobile = this.domHandlerService.window?.innerWidth >= 450;
  }

  public goHome(): void {
    this.router.navigate(['/']);
  }

  callUs() {
    let url = null;
    if(this.isMobile) {
      url = "https://wa.me/22376007979?text=Bonjour%2C%20je%20souhaiterais%20avoir%20plus%20d%27informations%20sur%20la%20fa%C3%A7on%20d%27activer%20ma%20page%20Fidelity-market.";
    }else{
      url = "tel:+22376007979";
    }
    window.open(url,"_blank");
  }

}
