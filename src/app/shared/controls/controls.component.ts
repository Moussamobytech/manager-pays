import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { AppService } from '../../app.service';
import { Product } from 'src/app/models/product.models';
import { CommonService } from 'src/app/services/common.service';
import { ProductService } from 'src/app/services/product.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ControlsComponent implements OnInit {
  @Input() product: Product;
  @Input() type: string;
  @Input() pageName: string;
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter<any>();
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  public count: number = 1;
  currentUser: any;

  constructor(
    private auth: AuthenticationService, 
    public appService: AppService, 
    public cm: CommonService, 
    public produitService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {

    this.currentUser = this.auth.currentUser()
    if (this.product) {
      if (this.product.cartCount > 0) {
        this.count = this.product.cartCount;
        // console.log(this.count);
      }
    }
  }

  public increment() {
    if (this.count < this.product.quantite) {
      this.count++;
      this.updateQuantity(this.count, 'increment');
    } else {
      this.cm.openFailureSnackBar(`Vous ne pouvez pas choisir plus d'articles que ce qui est disponible. En stock ${this.product.quantite} articles.`);
    }
  }

  public decrement() {
    if (this.count > 1) {
      this.count--;
      this.updateQuantity(this.count, 'decrement');
    }
  }

  private updateQuantity(count: number, action: string) {
    const price = parseFloat(this.product.priceBasic || this.product.pricePromotion);
    if (isNaN(price)) {
      this.cm.openFailureSnackBar('Prix ​​du produit non valide. Veuillez vérifier les détails du produit.');
      return;
    }

    const obj = {
      productId: this.product.id,
      soldQuantity: count,
      total: count * price,
    };

    if (action === 'increment') {
      this.changeQuantityInc(obj, this.product);
    } else {
      this.changeQuantityDec(obj, this.product);
    }
  }

  public addToCart(product: Product): void {
    const currentProduct = this.appService.Data.cartList.find((item) => item.id === product.id);
    if (currentProduct) {
      const availableCount = this.product.quantite;
      const addedCount = currentProduct.cartCount + this.count;

      if (addedCount <= availableCount) {
        product.cartCount = addedCount;
      } else {
          this.cm.openFailureSnackBar("Vous ne pouvez pas ajouter plus d'articles que ce qui est disponible. En stock ${availableCount} articles et vous avez déjà ajouté ${currentProduct.cartCount} article(s) à votre panier.")
        return;
      }
    } else {
      product.cartCount = this.count;
    }
    this.appService.addToCart(product);
  }

  public openWA(product: Product) {
    this.appService.saveLogs({
      username: window.navigator.product,
      utilisateur: window.navigator.productSub,
      agent: window.navigator.userAgent,
      vendor: window.navigator.vendor,
      platform: window.navigator.platform,
      service: 'CONTACT_SELLER',
      amount: product.priceBasic,
      extraData: product?.id,
      localisation: '',
      status: 'SUCCEED',
      dateAction: '',
      language: window.navigator.language,
    });

    const contactPrefix = product.contact.length === 8 ? '+223' : '+225';
    const url ='https://wa.me/' +(contactPrefix + product.contact || '+22376007979') +'?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20produit%20' +encodeURIComponent(product?.nom || '') +'.%20Prix%20%3A%20' +encodeURIComponent(product?.priceBasic || '');
    window.open(url, '_blank');
  }

  // public addToWishList(product: Product) {
  //   this.appService.addToWishList(product);
  // }

  public openProductDialog(event: any) {
    this.onOpenProductDialog.emit(event);
  }

  public changeQuantityInc(value: any, product: Product) {
    this.appService.increment(product);
    this.onQuantityChange.emit(value);
  }

  public changeQuantityDec(value: any, product: Product) {
    this.appService.decrement(product);
    this.onQuantityChange.emit(value);
  }

  toggleLike(product: any) {
    if(!this.currentUser) {
      this.cm.openFailureSnackBar("Veuillez vous connecter pour ajouter des produits aux favoris");
      return;
    }
    this.produitService.addToFavorites(product.id, this.currentUser.id).subscribe({
      next: (datas) => {
        product.isFavorite = !product.isFavorite;
        this.cm.openSuccessSnackBar(datas.message || "Produit ajouté aux favoris");
        if (this.pageName === 'account-customer' && window.location.hash.includes('favoris')) {
          this.router.navigate(['/account-customer']);
          this.produitService.getProduitsLikesByUser(this.currentUser.id).subscribe({
            next: (produits) => {
              this.onQuantityChange.emit(produits);
            }
          });
        }
      },
      error: (error) => {
       // console.log("error!!!!!!!!!!! ", error);
        if (error.status === 400) {
          this.cm.openFailureSnackBar("Produit est déjà dans les favoris");
        } else {
          this.cm.openFailureSnackBar("Une erreur est survenue");
        }
      }
    });
  }
  

  public promo(key) {
    let res = ""
    switch (key) {
      case "PROMOTION":
        res = "En promotion"
        break;

      case "OFFRE_BIENVENUE":
        res = "Offre bienvenue"
        break;

      case "LIVRAISON_GRATUITE":
        res = "Livraison gratuite"
        break;

      case "PARRAINAGE":
        res = "Parrainage"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }
}
