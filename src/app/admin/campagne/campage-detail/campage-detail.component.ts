import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { ActivatedRoute } from '@angular/router';
import { CampagneService } from 'src/app/services/campagne.service';

@Component({
  selector: 'app-campage-detail',
  templateUrl: './campage-detail.component.html',
  styleUrl: './campage-detail.component.scss'
})
export class CampageDetailComponent implements OnInit {

  public campagne : any
  public campagneId : string;
  public sub: any;
  public viewCol: number = 25;
  public page: any;
  public count = 6;
  public settings:Settings;

  constructor( public appService : AppService, public campagneService : CampagneService,  public appSettings:AppSettings,
    private activatedRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.getCampagneById(this.campagneId)
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.getCampagneById(params['id']);
      }
      else{
        this.getCampagneById(this.campagneId)
      }
    });
  }
  public getCampagneById(id){
    try {
      let res = this.campagneService.getCampagneById(id);
      this.campagne = res;
      console.log('Campagne Id ', this.campagne);
      console.log('Campagne Id ', this.campagne.produitList);
    } catch (error) {
      console.log('error Campagne Id ', error);
    }
   
  }
}
