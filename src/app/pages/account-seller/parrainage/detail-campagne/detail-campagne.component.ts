import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { id } from '@swimlane/ngx-charts';
import { Router } from 'express';
import { CampagneService } from 'src/app/services/campagne.service';
import { CommonMessageService } from 'src/app/services/common-message.service';

@Component({
  selector: 'app-detail-campagne',
  standalone: true,
  imports: [],
  templateUrl: './detail-campagne.component.html',
  styleUrl: './detail-campagne.component.scss'
})
export class DetailCampagneComponent implements OnInit{
  id: any;
  sub: any;
  campagneCodes:any
  constructor( 
     private activatedRoute: ActivatedRoute,
     private commonService: CommonMessageService,
          private campagneService: CampagneService,){

  }

  ngOnInit(): void {
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.id = params['id'];
        this.getAllCodeByCampagne(this.id);     
        this.getCampagneById(); }
    });
   
  }
 
  public getCampagneById(){
    this.campagneService.find(this.id).then((data : any) =>{
      console.log(":::::::::::::::: MY CAMPAGNE =",JSON.stringify(data))
    })
  }

  getAllCodeByCampagne(id) {
    this.campagneService.getAllCodeByCampagne(id).subscribe({
      next: (datas) => {
        this.campagneCodes = datas;
        console.log(":::::::::::::::: ALL CODE = ",JSON.stringify(this.campagneCodes));
        
      },
      error: (err) => {
        if (err && err.statusCode == "BAD_REQUEST") {
          this.commonService.errorToast(err.body.message);
        } else {
          this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
        }
      }
    });
  }

}
