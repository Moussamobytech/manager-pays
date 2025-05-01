import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.models';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  promoProducts: Product[];
    loadedProductCount:number;
    unchangedProducts: any;
    public viewCount: number = (window.innerWidth<=400)?8:10; // nombre de produits à charger après chaque clic sur <charger plus

    constructor(private produitService:ProductService) { }

    ngOnInit() {
      this.getPromoProducts();
    }

    async getPromoProducts() {
      const products = await this.produitService.getProductByTop();
      this.unchangedProducts = products
      .map(product => {
        return {
          ...product,
          priceBasic: this.parsePrice(product.priceBasic),
          pricePromotion: this.parsePrice(product.pricePromotion),
        };
      })
      .filter(product => (product.pricePromotion !== null)&&(product.pricePromotion < product.priceBasic));
      this.promoProducts = this.unchangedProducts.slice(0, this.viewCount);
    }

    parsePrice (price: any) {
      const parsedPrice = parseFloat(price);
      return isNaN(parsedPrice) ? null : parsedPrice;
    }

    loadMore(): void {
      const nextIndex = this.promoProducts.length + this.viewCount;
      this.loadedProductCount = nextIndex;
      this.promoProducts = this.unchangedProducts.slice(0, nextIndex);
    }

}
