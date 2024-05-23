import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';

import { Subscription } from 'rxjs';
import { DomHandlerService } from 'src/app/dom-handler.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen:boolean = true;

  public links = [
    { name: 'Dashboard', href: 'dashboard', icon: 'dashboard' },
    { name: 'Information', href: 'information', icon: 'info' },
    // { name: 'Addresses', href: 'addresses', icon: 'location_on' },
    { name: 'Produits', href: 'products-seller', icon: 'add_shopping_cart' },
    // { name: 'Order History', href: 'orders', icon: 'add_shopping_cart' },
    { name: 'Logout', href: '/sign-in', icon: 'power_settings_new' },
  ];
  constructor(public router: Router, public domHandlerService: DomHandlerService,
    public translateService: TranslateService
  ) { }

  ngOnInit() {

    if(this.domHandlerService.window?.innerWidth < 960){
      this.sidenavOpen = false;
    };
    this.links = [
      { name: this.translateService.instant('NAV.HOME') || 'Dashboard', href: 'dashboard', icon: 'dashboard' },
      { name: this.translateService.instant('NAV.SETTING') || 'Information', href: 'information', icon: 'info' },
      { name: this.translateService.instant('NAV.ALL_PRODUCTS') || 'Produits', href: 'products-seller', icon: 'add_shopping_cart' },
      { name: this.translateService.instant('LOGOUT') || 'Logout', href: '/sign-in', icon: 'power_settings_new' },
    ];

  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(this.domHandlerService.window?.innerWidth < 960){
          this.sidenav.close();
        }
      }
    });
  }


}
