import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../app.service';
import { Settings, AppSettings } from '../../../app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html'
})
export class TopMenuComponent implements OnInit {

  public currencies = ['USD', 'EUR'];
  public currency:any;
  public user:any;
  deferredPrompt: any;
  installButtonVisible: boolean = false;

  public settings: Settings;
  constructor(public appSettings:AppSettings, public appService:AppService, public translateService: TranslateService, private auth:AuthenticationService) {
    this.settings = this.appSettings.settings;
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    event.preventDefault();
    this.deferredPrompt = event;
    this.installButtonVisible = true;
  }

  promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        this.deferredPrompt = null;
      });
    }
  }

  ngOnInit() {
    this.currency = this.currencies[0];
    this.changeLang("fr")
    this.user  = JSON.parse(sessionStorage.getItem('currentUser')!);
      // this.username = sessionStorage.getItem('username')!;
      // console.log("TopMenuComponent user :::: ",this.user);
  }

  public changeCurrency(currency){
    this.currency = currency;
  }

  public changeLang(lang:string){
    this.translateService.use(lang);

  }

  public getLangText(lang){
    if(lang == 'de'){
      return 'German';
    }
    else if(lang == 'fr'){
      return 'Français';
    }
    else if(lang == 'ru'){
      return 'Russian';
    }
    else if(lang == 'tr'){
      return 'Turkish';
    }
    else{
      return 'English';
    }
  }

  logout() {
    this.auth.logout();
  }

}
