import { AfterViewInit, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-seller-product-card',
  templateUrl: './seller-product-card.component.html',
  styleUrls: ['./seller-product-card.component.scss']
})
export class SellerProductCardComponent {
  @Input() product: Product;
  @Input() viewCol: 20|33.3|number;
  secondView: boolean;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewCol']) {
      this.secondView= (this.viewCol == 100)&&(window.innerWidth<=600);
    }
  }

}
