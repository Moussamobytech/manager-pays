import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-seller-product-card',
  templateUrl: './seller-product-card.component.html',
  styleUrls: ['./seller-product-card.component.scss']
})
export class SellerProductCardComponent implements OnInit {
  @Input() product: Product;
  @Input() viewCol: number
  constructor() { }

  ngOnInit() {
  }

}
