import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Settings, AppSettings } from './app.settings';
import { TranslateService } from '@ngx-translate/core';
import { DomHandlerService } from './dom-handler.service';
import { LocalService } from './services/local.service';
import { AnalyticsService } from './services/analitycs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  loading: boolean = false;
  public settings: Settings;
  isServer: boolean = true;

  constructor(public appSettings: AppSettings,
              public router: Router,
              public translate: TranslateService,
              private localStorage: LocalService,
              private analitycsService: AnalyticsService,
              public domHandlerService: DomHandlerService){
    this.settings = this.appSettings.settings;
    translate.addLangs(['en','de','fr','ru','tr']);
    let lg = (this.localStorage.getJsonValue("lang-key")) || 'fr';
    translate.setDefaultLang(lg.lang);
    translate.use(lg.lang);
  }

  ngOnInit() {
   if (this.domHandlerService.isBrowser) {
      setTimeout(() => {
        this.isServer = false;
      })
    }
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.domHandlerService.winScroll(0, 0);
      }
    })
  }
}
