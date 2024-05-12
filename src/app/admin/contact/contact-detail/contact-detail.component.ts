import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent implements OnInit {

  public contact : any
  public contactId : string;
  public sub: any;
  public viewCol: number = 25;
  public page: any;
  public count = 6;
  public settings:Settings;
  currentUser : User

  constructor( public appService : AppService, public appSettings:AppSettings,
    private auth : AuthenticationService,private activatedRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    console.log("::::::::::", this.currentUser)
    this.getContactById(this.contactId)
    this.sub = this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.getContactById(params['id']);
      }
      else{
        this.getContactById(this.contactId)
      }
    });
  }
  public getContactById(id){
    this.appService.getContactById(id).subscribe(data=>{
      this.contact = data;
      console.log('contact Id ', this.contact);
      console.log('contact Id ', this.contact
    );
    });
  }

}
