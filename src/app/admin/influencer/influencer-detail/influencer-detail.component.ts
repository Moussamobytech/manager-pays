import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { InfluencerService } from 'src/app/services/influencer.service';

@Component({
  selector: 'app-influencer-detail',
  templateUrl: './influencer-detail.component.html',
  styleUrl: './influencer-detail.component.scss'
})
export class InfluencerDetailComponent implements OnInit {

  public influencer : any
  public influencerId : string;
  public sub: any;
  public viewCol: number = 25;
  public page: any;
  public count = 6;
  public settings:Settings;

  constructor( public appService : AppService, public influencerService: InfluencerService, public appSettings:AppSettings,
    private activatedRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.getInfluencerById(this.influencerId)
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.getInfluencerById(params['id']);
      }
      else{
        this.getInfluencerById(this.influencerId)
      }
    });
  }
  public getInfluencerById(id){
    this.influencerService.find(id).subscribe(data=>{
      this.influencer = data;
      console.log('Influencer Id ', this.influencer);

    });
  }
}
