import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Data, AppService } from '../../app.service';
import { Product } from 'src/app/models/product.models';
// import { Product } from '../../app.models';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {
  @Input() product: Product;
  @Input() type: string;
  @Input() pageName: string;
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  public count: number = 1;
  public align = 'center center';
  constructor(public appService: AppService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    if (this.product) {
      if (this.product.cartCount > 0) {
        this.count = this.product.cartCount;
      }
    }
    this.layoutAlign();

    
  }

  public layoutAlign() {
    if (this.type == 'all') {
      this.align = 'space-between center';
    }
    else if (this.type == 'wish') {
      this.align = 'start center';
    }
    else {
      this.align = 'center center';
    }
  }



  public increment() {
    let price;
    if (this.count < this.product.quantite) {
      this.count++;

      // Conversion de priceBasic de String à Number

      // Conversion de newPrice de String à Number
      if (this.product.priceBasic != null) {
        price = parseFloat(this.product.priceBasic);

      }
      else {
        price = parseFloat(this.product.pricePromotion);

      }
      if (isNaN(price)) {
        // Gestion des erreurs si priceBasic ne peut pas être converti en un nombre
        this.snackBar.open('Invalid product price. Please check the product details.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
        return;
      }

      let obj = {
        productId: this.product.id,
        soldQuantity: this.count,
        total: this.count * price
      };
      this.changeQuantityInc(obj, this.product);
    } else {
      this.snackBar.open('You cannot choose more items than available. In stock ' + this.count + ' items.', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
    }
  }

  public decrement() {
    let price;
    if (this.count > 1) {
      this.count--;

      // Conversion de newPrice de String à Number
      if (this.product.priceBasic != null) {
        price = parseFloat(this.product.priceBasic);

      }
      else {
        price = parseFloat(this.product.pricePromotion);

      }

      if (isNaN(price)) {
        // Gestion des erreurs si newPrice ne peut pas être converti en un nombre
        this.snackBar.open('Invalid product price. Please check the product details.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
        return;
      }

      let obj = {
        productId: this.product.id,
        soldQuantity: this.count,
        total: this.count * price
      };
      this.changeQuantityDec(obj, this.product);
    }
  }


  public addToCompare(product: Product) {
    this.appService.addToCompare(product);
  }

  public openWA(product: Product) {
    console.log(window);
    console.log(window.navigator);

    this.appService.saveLogs({
      'username': window.navigator.product,
      'utilisateur': window.navigator.productSub,
      'agent': window.navigator.userAgent,
      'vendor': window.navigator.vendor,
      'platform': window.navigator.platform,
      'service': 'CONTACT_SELLER',
      'amount': product.priceBasic,
      'extraData': product?.id,
      'localisation': '',
      'status': 'SUCCEED',
      'dateAction': '',
      'language': window.navigator.language
    });
    let url = "https://wa.me/" + ((((product.contact).length == 8) ? "+223" + product.contact : "+225" + product.contact) || '+22376007979') + "?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20produit%20" + product?.nom + ".%20Prix%20%3A%20" + product?.priceBasic + ""
    window.open(url, "_blank");
  }





  public addToWishList(product: Product) {
    this.appService.addToWishList(product);
  }

  public addToCart(product: Product): void {

    const currentProduct = this.appService.Data.cartList.find(item => item.id === product.id);
    if (currentProduct) {
      const availableCount = this.product.quantite;
      const addedCount = currentProduct.cartCount + this.count;

      if (addedCount <= availableCount) {
        product.cartCount = addedCount;
      }
      else {
        const errorMessage = `You cannot add more items than available. In stock ${availableCount} items and you already added ${currentProduct.cartCount} item(s) to your cart`;
        this.snackBar.open(errorMessage, '×', { panelClass: 'error', verticalPosition: 'top', duration: 5000 });
        return;
      }
    }
    else {
      product.cartCount = this.count;
    }

    this.appService.addToCart(product);
  }

  public openProductDialog(event) {
    this.onOpenProductDialog.emit(event);
  }

  public changeQuantityInc(value, product: Product) {
    this.appService.increment(product);
    this.onQuantityChange.emit(value);
  }
  public changeQuantityDec(value, product: Product) {
    this.appService.decrement(product);
    this.onQuantityChange.emit(value);
  }

}
