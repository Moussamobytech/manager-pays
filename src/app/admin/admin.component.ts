import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { AppSettings, Settings } from '../app.settings';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from './components/menu/menu.service';
import { DomHandlerService } from '../dom-handler.service';
import { AuthenticationService } from '../services/auth.service';
import { User } from '../models/user.models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild('sidenav') sidenav:any;
  public userImage = 'assets/images/others/admin.jpg';
  public settings:Settings;
  public menuItems:Array<any>;
  public toggleSearchBar:boolean = false;
  public users:any;
  currentUser : User

  constructor(public appSettings:AppSettings, public translateService: TranslateService,
              private authenticationService: AuthenticationService,
              public router:Router,
              private menuService: MenuService,
              public domHandlerService: DomHandlerService,
              private auth : AuthenticationService,
            ){
    this.settings = this.appSettings.settings;
  }

  async ngOnInit() {
    this.currentUser = this.auth.currentUser()
    // console.log("::::::::: ", this.currentUser)
    if(this.domHandlerService.window?.innerWidth <= 960){
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    };
    setTimeout(() => {
      this.settings.theme = 'fidelity';
    });
    this.menuItems = this.menuService.getMenuItems();
    // this.localStorage.setJsonValue("lang-key",{lang})
    // console.log(lg.lang)
    this.translateService.use("fr");
    this.auth.list().then((data: any) =>{
      this.users= data.map((user: any) => this.mapToUser(user));
    });
  }

  ngAfterViewInit(){
    if(this.domHandlerService.winDocument.getElementById('preloader')){
      this.domHandlerService.winDocument.getElementById('preloader').classList.add('hide');
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
      if( this.domHandlerService.window?.innerWidth <= 960){
        this.sidenav.close();
      }
    });
    this.menuService.expandActiveSubMenu(this.menuService.getMenuItems());
  }

  public toggleSidenav(){
    this.sidenav.toggle();
  }

  public scrollToTop(){
    var scrollDuration = 200;
    var scrollStep = -this.domHandlerService.window?.pageYOffset / (scrollDuration / 20);
    var scrollInterval = setInterval(()=>{
      if(this.domHandlerService.window?.pageYOffset != 0){
        this.domHandlerService.window?.scrollBy(0, scrollStep);
      }
      else{
        clearInterval(scrollInterval);
      }
    },10);
    if(this.domHandlerService.window?.innerWidth <= 768){
      setTimeout(() => {
        this.domHandlerService.window?.scrollTo(0,0);
      });
    }
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    if(this.domHandlerService.window?.innerWidth <= 960){
      this.settings.adminSidenavIsOpened = false;
      this.settings.adminSidenavIsPinned = false;
    }
    else{
      this.settings.adminSidenavIsOpened = true;
      this.settings.adminSidenavIsPinned = true;
    }
  }

  private mapToUser(user: any) {
    return {
      Prenom: user.firstname,
      Nom: user.lastname,
      Email: user.email,
      Telephone: this.formatPhone(user.phoneNumber),
      Type: this.userType(user.profiles[0].name),
      MembreDepuis: new Date(user.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' }),
      Status:(user.enabled)?'active':'inactive',
      Adresse:user.adresse,
    };
  }

  userType(user: string): any {
    if( (/admin/ig).test(user) ){
      return ('admin').toUpperCase();
    }else if( (/particulier/ig).test(user) ){
      return ('particulier').toUpperCase();
    }else if( (/boutique/ig).test(user) ){
      return ('boutique').toUpperCase()
    }else{
      return ('inconnue').toUpperCase()
    }
  }

  formatPhone(phone:any){
    if(phone != 'null' && phone != null){
      if((phone.length == 8)){
        return "+223"+phone;
      }else if(phone.length == 10){
        return "+225"+phone;
      }else{
        return phone;
      }
    }
  }

  logout(){
    this.authenticationService.logout();
    this.router.navigateByUrl("/")
  }


}
