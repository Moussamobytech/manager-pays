import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
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
        this.AppService.searchProducts(searchTerm).pipe(
          map(products => products.filter(product => product.etat !== "INACTIF")),
          map(filteredProducts => filteredProducts.slice(0, 15))
        ).subscribe(products => {
          this.products = products;
  
          // ➕ Si aucun produit trouvé, enregistrer le terme s'il est valide
          if (products.length === 0 && this.isSearchTermValid(searchTerm)) {
            console.log("🔍 Terme valide mais aucun produit trouvé :", searchTerm);
            this.AppService.searchNotFoundTerme(searchTerm).subscribe(datas => {
             // console.log("💾 Terme enregistré :", datas);
            });
          }
        });
      }
    });
  }
  

   isSearchTermValid(term: string): boolean {
    const blacklist = ['aaa', 'zzz', 'test', '123', '???', '!!!'];
    return term &&
      term.trim() !== '' &&
      !/^([a-zA-Z])\1{2,}$/.test(term) &&
      /[a-zA-Z]{2,}/.test(term) &&
      /[a-zA-Z]/.test(term) &&
      !blacklist.includes(term.toLowerCase());
  }
  

}
