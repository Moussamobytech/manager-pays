import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AppService } from '../../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/models/product.models';
import { User } from '../../models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() product: Product;
  @Input() type: string;
  @ViewChild('simillarContainer', { static: false }) simillarContainer!: ElementRef;
  showSimilarNav = false;
  total = [];
  grandTotal = 0;
  cartItemCount = [];
  cartItemCountTotal = 0;
  user :User ;
  idUser :string;
  isSmallScreen: boolean = false;
  scrollAmount: number = 0;

  phoneMinLength: number = 8; // Longueur par défaut pour le Mali
  phoneMaxLength: number = 8; // Longueur par défaut pour le Mali
  phonePlaceholder: string = 'xxxxxxxx'; // Placeholder par défaut pour le Mali


  constructor(private breakpointObserver: BreakpointObserver, public appService:AppService,public snackBar: MatSnackBar,
    private authService:AuthenticationService,public formBuilder: UntypedFormBuilder,
  ) { }
  public count:number = 1;
  public productList: Product[];

  pageName:string="cart";

    billingForm: UntypedFormGroup;
  

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
    .subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.getAllArticleInPanier();
    setTimeout(() => {
      this.onResize();
    });


     // Écoute des changements du champ téléphone
     this.billingForm.get('phone')?.valueChanges.subscribe((phone: string) => {
      if (!this.isPopulatingForm && phone && phone.length >= this.phoneMinLength) {
        this.loadUserByPhone(phone);
      }
    });

    this.initializeBillingForm();
  }


  initializeBillingForm() {
    this.billingForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      username:[''],
      phone: ['', Validators.required],
      country: ['mali'],

      /*  
      city: [''],
      state: '',
      zip: [''],*/
    });
  }
  
  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     this.onResize();
  //     console.log(this.showSimilarNav);
  //   });
  // }

  @HostListener('window:resize')
  onResize() {
    if (this.simillarContainer) {
      const containerEl = this.simillarContainer.nativeElement;
      this.showSimilarNav = containerEl.scrollWidth > containerEl.clientWidth;
    }
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

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::PANIER:::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
monPanierContient(){
  this.appService.addCommande(this.idUser, this.productList).subscribe(
    () => {
      this.snackBar.open('Commande effectuée avec succès', '×', {
        panelClass: 'success',
        verticalPosition: 'top',
        duration: 3000
      });
      this.clear()
       sessionStorage.removeItem('panier');
    sessionStorage.removeItem('totalCartCount');
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


  public updateCart(value){
    if(value){
      this.total[value.productId] = value.total;
      this.cartItemCount[value.productId] = value.soldQuantity;
      this.grandTotal = 0;
      this.total.forEach(price=>{
        this.grandTotal += price;
      });
      this.cartItemCountTotal = 0;
      this.cartItemCount.forEach(count=>{
        this.cartItemCountTotal +=count;
      });

      this.appService.Data.totalPrice = this.grandTotal;
      this.appService.Data.totalCartCount = this.cartItemCountTotal;

      this.appService.Data.cartList.forEach(product=>{
        this.cartItemCount.forEach((count,index)=>{
          // if(product.id == index){
          //   product.cartCount = count;
          // }
        });
      });

    }
  }

  public remove(product) {
   this.appService.remove(product);
   this.getAllArticleInPanier();
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

  public getProductDiscount(product: any): number {
    const priceBasic = parseFloat(product.priceBasic);
    const pricePromotion = parseFloat(product.pricePromotion);
    if (isNaN(priceBasic) || isNaN(pricePromotion)) {
      return 0;
    }

    return priceBasic - pricePromotion;
  }

  swipeSimilarProduct(direction: 'left' | 'right'): void {
    const container = this.simillarContainer?.nativeElement;
    if (!container) return;
    const mobileStep = 120;
    const desktopStep = 180;

    const scrollStep = window.innerWidth >= 830 ? desktopStep : mobileStep;
    const maxScroll = container.scrollWidth - container.clientWidth;

    let newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollStep : scrollStep);

    if(newScrollPosition === (mobileStep+maxScroll)|| newScrollPosition === (desktopStep+maxScroll)){
      newScrollPosition = 0;
    }else{
      newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll));
    }

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
  }

  isPopulatingForm: boolean = false;

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


}
