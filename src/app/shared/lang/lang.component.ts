import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-lang',
  templateUrl: './lang.component.html',
  styleUrls: ['./lang.component.scss']
})
export class LangComponent implements OnInit {
  constructor(public translateService: TranslateService,private localStorage:LocalService) { }

  ngOnInit() { }

  public changeLang(lang:string){
    this.localStorage.setJsonValue("lang-key",{lang})
    // console.log(lg.lang)
    this.translateService.use(lang);
  }

}
