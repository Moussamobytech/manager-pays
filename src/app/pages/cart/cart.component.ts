import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { Data, AppService } from '../../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/models/product.models';
import { User } from '../../models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { id } from '@swimlane/ngx-charts';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() product: Product;
  @Input() type: string;
  @ViewChild('simillarContainer1', { static: false }) simillarContainer1!: ElementRef;
  @ViewChild('simillarContainer2', { static: false }) simillarContainer2!: ElementRef;
  showSimilarNav1 = false;
  showSimilarNav2 = false;

  public align = 'center center';
  total = [];
  grandTotal = 0;
  cartItemCount = [];
  cartItemCountTotal = 0;
  user :User ;
  idUser :string;
  isSmallScreen: boolean = false;
  scrollAmount: number = 0;

  constructor(private breakpointObserver: BreakpointObserver, public appService:AppService,public snackBar: MatSnackBar,
    private authService:AuthenticationService,
  ) { }
  // ngAfterViewInit(): void {
  //   if (!this.simillarContainer) {
  //     console.error('simillarContainer is not available!');
  //   }
  // }
  public count:number = 1;
  public productList: Product[];

  pageName:string="cart";

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
    .subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.getAllArticleInPanier();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.simillarContainer1||this.simillarContainer2) {
      const containerEl1 = this.simillarContainer1.nativeElement;
      const containerEl2 = this.simillarContainer1.nativeElement;
      this.showSimilarNav1 = containerEl1.scrollWidth > containerEl1.clientWidth;
      this.showSimilarNav2 = containerEl1.scrollWidth > containerEl1.clientWidth;
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

  swipeSimillarProduct(direction: string, containerNumb) {
    let containerRef = (containerNumb === 1)? this.simillarContainer1 : this.simillarContainer2;
    if (!containerRef) return;

    const container = containerRef.nativeElement;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollStep = window.innerWidth >= 830 ? 180 : 115;

    let newScrollPosition = direction === 'left'
      ? container.scrollLeft - scrollStep
      : container.scrollLeft + scrollStep;

    if (newScrollPosition < 0) newScrollPosition = 0;
    if (newScrollPosition > maxScroll) newScrollPosition = 0;

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
  }

}


