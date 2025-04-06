import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Product } from 'src/app/models/product.models';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductsCardComponent implements OnInit {

  @Input() product: Product;
  @Input() viewCol: number;
  secondView: boolean;
  constructor(private produitService:ProductService) { }

  ngOnInit(): void {
    this.secondView= (this.viewCol == 100)&&(window.innerWidth<=600);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewCol']) {
      this.secondView= (this.viewCol == 100)&&(window.innerWidth<=600);
    }
  }

  setProductViewCount(id){
    this.produitService.viewProductById(id).then(data => {
    data
    })
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/logo_fidelity.gif';
  }

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.product.image1;
  }
}
