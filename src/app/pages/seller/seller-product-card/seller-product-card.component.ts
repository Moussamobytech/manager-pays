import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-seller-product-card',
  templateUrl: './seller-product-card.component.html',
  styleUrls: ['./seller-product-card.component.scss']
})
export class SellerProductCardComponent implements OnInit {
  @Input() product: Product;
  @Input() viewCol: number;
  secondView: boolean;
  constructor() { }

  ngOnInit(): void {
    this.secondView= (this.viewCol == 100)&&(window.innerWidth<=600);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewCol']) {
      this.secondView= (this.viewCol == 100)&&(window.innerWidth<=600);
    }
  }

}
