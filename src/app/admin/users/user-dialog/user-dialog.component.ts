import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import { User } from 'src/app/models/user.models';
import { StringMatchValidators } from 'src/app/shared/confirmed.validator';
import { UserTypePipe } from 'src/app/theme/pipes/userType.pipe';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  public form:UntypedFormGroup;
  public user:User;
  usernameType:string;
  public action:string;
  public userTypes:any[]=[
    {value:'admin',viewValue:'Admin',},
    {value:'particulier',viewValue:'Particulier'},
    {value:'boutique',viewValue:'Boutique'}
  ]
  public hide:  boolean = true;
  public hide2: boolean = true;
  constructor(
              private dialogRef: MatDialogRef<UserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: UntypedFormBuilder,
  ){
    this.user = data.user;
    this.action = data.action;
    if(this.action == "add"){
      this.form = this.fb.group({

        firstname: [null, Validators.compose([Validators.required])],
        lastname: [null, Validators.compose([Validators.required])],
        type: this.fb.group({
          name: [null, Validators.compose([Validators.required])],
        }),
        contacts: this.fb.group({
          email: [null, Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
          phoneNumber: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+$/),Validators.minLength(8)])],
          address: null,
        }),
        auth: this.fb.group({
          password1: [null,Validators.compose([Validators.required,Validators.minLength(8)])],
          password2: [null,Validators.compose([Validators.required,Validators.minLength(8)])]
        },[StringMatchValidators.MatchValidator('password1','password2')]),
      });

    }else if(this.action == "update"){

      this.form = this.fb.group({
        firstname: [this.user.firstname, Validators.compose([Validators.required])],
        lastname: [this.user.lastname, Validators.compose([Validators.required])],
        // username: [this.user.username, Validators.compose([Validators.required])],
        type: this.fb.group({
          name:this.userTypePipe(this.user.profiles[0].name),
        }),
        contacts: this.fb.group({
          email: [this.user.email, Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
          phoneNumber: [this.user.phoneNumber, Validators.compose([Validators.required, Validators.pattern(/^[0-9]+$/),Validators.minLength(8)])],
          address: this.user.adresse,
        }),
        // state: this.fb.group({
          // password1: [null,Validators.compose([Validators.minLength(8)])],
        //   // password2: [null,Validators.compose([Validators.minLength(8)])],
        //   isEnabled: this.user.enabled,
        // },[StringMatchValidators.MatchValidator('password1','password2')]),
      });
      // this.usernameType = ((/^[0-9]$/).test(this.form.controls.username.value)) ? 'phone' : 'email';

    }
  }

  ngOnInit() {
  }
  private userTypePipe(value:string){
    let data:string;
    if( (/admin/ig).test(value) ){
      data= ('admin');
    }
    else if( (/particulier/ig).test(value) ){
      data= ('particulier');
    }
    else{
      data= ('boutique');
    }
    return data;
  }

  close(): void {
    this.dialogRef.close();
  }

  end(userId:any,formVal?:any){
    if(this.action =="update"){
      return [
        {user:formVal, id:userId}
      ];
    }else if(this.action =="add"){
      return formVal;
    }else{
      return userId;
    }
  }
}
