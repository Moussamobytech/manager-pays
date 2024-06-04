import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
// import { Product } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { Product } from 'src/app/models/product.models';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit {


  products: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public AppService : AppService

  ) {}

  ngOnInit(): void {


    this.route.queryParams.subscribe(params => {
        const searchTerm = params['q'];
        if (searchTerm) {
          return this.AppService.searchProducts(searchTerm).subscribe(products => {
            this.products = products;
          });
        } else {
          return [];
        }
      })
  }

}
