import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';

@Component({
  selector: 'app-brand-detail',
  templateUrl: './brand-detail.component.html',
  styleUrl: './brand-detail.component.scss'
})
export class BrandDetailComponent implements OnInit {

  public brand : any
  public brandId : string;
  public sub: any;
  public viewCol: number = 25;
  public page: any;
  public count = 6;
  public settings:Settings;

  constructor( public appService : AppService, public appSettings:AppSettings,
    private activatedRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.getBrandById(this.brandId)
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.getBrandById(params['id']);
      }
      else{
        this.getBrandById(this.brandId)
      }
    });
  }
  public getBrandById(id){
    this.appService.getBrandById(id).subscribe(data=>{
      this.brand = data;
      console.log('Brand Id ', this.brand);

    });
  }
}
