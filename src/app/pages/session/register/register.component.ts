import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StringMatchValidators } from '../../../shared/confirmed.validator';
import { CommonService } from 'src/app/services/common.service';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: FormControl|undefined;
  prenom: FormControl|undefined;
  email: FormControl|undefined;
  phone: FormControl|undefined;
  adresse: FormControl|undefined;
  password1: FormControl|undefined;
  password2: FormControl|undefined;
  registerForm: FormGroup | any;
  hide: boolean  = true;
  hide2: boolean = true;
  loading: boolean;

  constructor(private commonService:CommonService,private auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.name = new FormControl('', [Validators.required]);
    this.prenom = new FormControl('',[Validators.required]);
    this.email =  new FormControl('', [Validators.pattern(/^[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]);
    this.phone = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]);
    this.adresse = new FormControl('');
    this.password1 =  new FormControl('', [Validators.required, Validators.minLength(6)]);
    this.password2 =  new FormControl('', [Validators.required, Validators.minLength(6)]);

    this.registerForm = new FormGroup({
      name : this.name,
      prenom : this.prenom,
      email : this.email,
      phone : this.phone,
      adresse : this.adresse,
      password1 : this.password1,
      password2 : this.password2,
    }, [StringMatchValidators.MatchValidator('password1','password2')]);

  }

  get registerFormControl(){
    return this.registerForm.controls;
  }

  async register () {
    if(this.registerForm.valid){

      let data = this.registerForm.value;
      let formData = {
        role : ["particulier"],
        username : (data.email || data.phone),
        firstname : data.prenom,
        lastname : data.name,
        email : data.email,
        phoneNumber : data.phone,
        adresse : data.adresse,
        password : data.password2,
        typeofUser : (data.email)? 'email'  : 'tel'
      }

      try{
        let res = await this.auth.signup(formData).toPromise();
        if(res){
          console.log('results are in: ',res)
          this.commonService.goTo( 'authentication/login' );
          this.commonService.openSuccessSnackBar("Inscription Reussie avec succes...");
        }
      }catch(error){
        console.log( "Error", error );
      }
    }else{
      this.commonService.openFailureSnackBar("Inscription échoué !");
      if(this.registerForm.errors?.mismatch){
        this.commonService.openFailureSnackBar("Les deux mot de passes doivent etre identique !");
      }

    }
  }

}
