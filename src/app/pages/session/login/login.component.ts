import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: FormControl | String | undefined;
  password: FormControl | undefined;
  loginForm: FormGroup | undefined;
  hide: boolean= true;
  loading: boolean;
  loginFormValue: any;

  constructor(private commonService:CommonService, private auth: AuthenticationService) { }

  ngOnInit(): void {
    this.username = new FormControl('',Validators.required);
    this.password = new FormControl('',Validators.required);

    this.loginForm = new FormGroup({
      username : this.username,
      password : this.password
    });
  }

  get loginFormControl(){
    return this.loginForm.controls;
  }

  async login(loginFormValue:any) {
    if(this.loginForm.valid){
      try{
        const log = await this.auth.login(loginFormValue.username,loginFormValue.password);
        this.commonService.openSuccessSnackBar("Connexion Reussie avec succes...");
      } catch(error){
        this.commonService.open("acces incorrect")
      }
    }else{
      this.commonService.openFailureSnackBar("Connexion échoué !")
    }
  }

}

