import { Component, OnDestroy, OnInit, ViewChild, Output, Input } from '@angular/core';
import { MediaChange, MediaObserver } from '@ngbracket/ngx-layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { filter, map, Subscription } from 'rxjs';
import { AppService } from '../../app.service';
import { Product } from 'src/app/models/product.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { error } from 'node:console';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('horizontalStepper') horizontalStepper: MatStepper;
  @Input() product: Product;
  stepperOrientation: 'horizontal' | 'vertical' = "horizontal";
  billingForm: UntypedFormGroup;
  deliveryForm: UntypedFormGroup;
  paymentForm: UntypedFormGroup;
  countries = [];
  months = [];
  years = [];
  deliveryMethods = [];
  grandTotal = 0;
  watcher: Subscription;
  total = [];
  cartItemCount = [];
  cartItemCountTotal = 0;
  user :User = null ;
  public productList: Product[];
  idUser :string;
  isPopulatingForm: boolean = false;
  profil : string = "user";


  phoneMinLength: number = 8; // Longueur par défaut pour le Mali
  phoneMaxLength: number = 8; // Longueur par défaut pour le Mali
  phonePlaceholder: string = 'xxxxxxxx'; // Placeholder par défaut pour le Mali


  modePayement:string = "A la livraison"
  selectedFile: any;

  constructor(
     public router:Router,
    public snackBar: MatSnackBar,private authService:AuthenticationService, public appService:AppService, public formBuilder: UntypedFormBuilder, public mediaObserver: MediaObserver) {
    this.watcher = mediaObserver.asObservable()
    .pipe(filter((changes: MediaChange[]) => changes.length > 0), map((changes: MediaChange[]) => changes[0]))
    .subscribe((change: MediaChange) => {
      if (change.mqAlias == 'xs') {
        this.stepperOrientation = 'vertical';
      }
      else if(change.mqAlias == 'sm'){
        this.stepperOrientation = 'vertical';
      }
      else if(change.mqAlias == 'md'){
        this.stepperOrientation = 'horizontal';
      }
      else{
        this.stepperOrientation = 'horizontal';
      }
    });
  }

  ngOnInit() {    
    //this.getUser();
    this.getAllArticleInPanier();
  
    this.initializeBillingForm();
    this.deliveryForm = this.formBuilder.group({
      deliveryMethod: [this.deliveryMethods[0], Validators.required]
    });
    this.paymentForm = this.formBuilder.group({
      cardHolderName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiredMonth: ['', Validators.required],
      expiredYear: ['', Validators.required],
      cvv: ['', Validators.required]
    });
  
    // Populate billing form if user exists
   /* if (this.user) {
      this.populateBillingForm(this.user);
    }*/

     // Écoute des changements du champ téléphone
     this.billingForm.get('phone')?.valueChanges.subscribe((phone: string) => {
      if (!this.isPopulatingForm && phone && phone.length >= this.phoneMinLength) {
        this.loadUserByPhone(phone);
      }
    });
    
    
  }

  onCountryChange(country: string): void {
    if (country === 'mali') {
      // Mali
      this.phoneMinLength = 8;
      this.phoneMaxLength = 8;
      this.phonePlaceholder = 'xxxxxxxx';
    } else if (country === 'civ') {
      // Côte d'Ivoire
      this.phoneMinLength = 10;
      this.phoneMaxLength = 10;
      this.phonePlaceholder = 'xxxxxxxxxx';
    }

    // Mettre à jour les validateurs de téléphone
    const phoneControl = this.billingForm.get('phone');
    phoneControl?.setValidators([
      Validators.required,
      Validators.minLength(this.phoneMinLength),
      Validators.maxLength(this.phoneMaxLength)
    ]);
    phoneControl?.updateValueAndValidity();
  }
  
  initializeBillingForm() {
    this.billingForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      boutique: '',
      company: '',
      email: ['', [Validators.email]],
      username:[''],
      phone: ['', Validators.required],
      address: [''],
      logo: [''],
      password: [''],
      role: [''],
      country: ['mali'],

      /*  
      city: [''],
      state: '',
      zip: [''],*/
    });
  }
  
  populateBillingForm(user: User) {
    this.isPopulatingForm = true; // Active le drapeau
    this.billingForm.patchValue({
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      address: user.adresse || '',
    });
    this.isPopulatingForm = false; // Désactive le drapeau
  }
  

  ngOnDestroy() { 
    this.watcher.unsubscribe();
  } 

  public placeOrder(){
    this.horizontalStepper._steps.forEach(step => step.editable = false);
    this.appService.Data.cartList.length = 0;    
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;

  }


  getAllArticleInPanier(){
    // Parse the stringified JSON array
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];
  
  
    // Check if the productList is an array
    if (Array.isArray(this.productList)) {
      this.productList.forEach(product => {
        this.total[product.id] = product.cartCount * parseFloat(product.priceBasic);
        this.grandTotal += product.cartCount * parseFloat(product.priceBasic);
        this.cartItemCount[product.id] = product.cartCount;
        this.cartItemCountTotal += product.cartCount;
        this.product = product;
      });
    } else {
      console.error("Product list is not an array.");
    }
}


loadUserByPhone(phone:string){

  this.authService.getUserByPhone(phone).subscribe(
    datas => {
      if(datas != null){
              this.populateBillingForm(datas);
              this.user = datas;
              sessionStorage.setItem('currentUser', JSON.stringify(this.user));
              
      }
       
        },
    error => {
      this.snackBar.open('Une erreur s\'est produite. Veillez réesayé !', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
      console.error("Erreur lors du chargement de user:", error);
    }
  );

}

commander(){

  let user = this.authService.currentUser();      
  if(user != null){    
    this.appService.addCommande(user.id, this.productList).subscribe(
      () => {
        this.snackBar.open('Commande effectuée avec succès', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.clear()
        this.router.navigate(["/cart"]);
          },
      error => {
        this.snackBar.open('Une erreur s\'est produite. Veillez réesayé !', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
        console.error("Erreur lors du réglage du statut de la campagne:", error);
      }
    ); 
  }
  else if (this.billingForm.valid) {
    console.log("2 EXISTING USER ==== ",this.idUser);

    const values = this.billingForm.value;
  
    // Génération du numéro de téléphone complet basé sur le pays
    const countryCode = values["country"] === "mali" ? "223" : values["country"] === "civ" ? "225" : "";
    const phone = countryCode + values["phone"];
  
    // Création du payload
    const payload = {
      username: phone,
      firstname: values["firstName"],
      lastname: values["lastName"],
      password: values["phone"] || '',
      phoneNumber: values["phone"],
      addresse: values["addresse"] || '',
      country: values["country"],
      state: values["state"] || '',
      code: values["zip"] || null,
      rccm: values["rccm"] || '',
      boutique: values["company"] || '',
      email: values["email"] || null,
      role: [this.profil || 'user'],
      typeOfUsername: 'phone'
    };
  
    // Création du compte
    this.authService.signup(payload).toPromise()
      .then(async (res: any) => {
        try {
          // Connexion de l'utilisateur
          const loginData = await this.authService.login(payload.username, payload.password).toPromise();
          const userInfo = await this.authService.info(loginData.username);
  
          if (!userInfo) {
            throw new Error('Impossible de récupérer les informations du client, merci de réessayer à nouveau');
          }
  
          // Récupération de l'utilisateur par téléphone et ajout de la commande
          const myUser = await this.authService.getUserByPhone(payload.phoneNumber).toPromise();
          await this.appService.addCommande(myUser.id, this.productList).toPromise();
  
          this.snackBar.open('Commande effectuée avec succès', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
  
          this.clear();
          this.router.navigate(["/cart"]);
  
        } catch (error: any) {
          console.error('Erreur lors du processus :', error);
          this.snackBar.open(error.message || 'Une erreur s\'est produite.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      })
      .catch((error: any) => {
        console.error('Erreur lors de la création du compte :', error);
        this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte!', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      });
  }
  
}
  


public clear(){
  this.productList.forEach(product=>{
    this.appService.resetProductCartCount(product);
  });
  this.productList.length = 0;
  this.appService.Data.totalPrice = 0;
  this.appService.Data.totalCartCount = 0;
  sessionStorage.removeItem('panier');
  sessionStorage.removeItem('totalCartCount');
}

getUser(){
  this.user = this.authService.currentUser();    
    if(this.user){
      this.idUser = this.user.id;
      console.log("1USERS :::::::::::::::: ",this.user);
      
    }
    console.log("2 USERS :::::::::::::::: ",this.user);

}

}
