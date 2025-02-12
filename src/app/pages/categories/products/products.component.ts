import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Settings, AppSettings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
// import { Category } from 'src/app/models/category.models';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-categories-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen:boolean = true;
  private sub: any;
  public viewCol: number = 25;
  public viewCount = 8;
  public sortings = [ 'SORTINGS.MOST_RECENT', 'SORTINGS.LOWEST_FIRST', 'SORTINGS.HIGHEST_FIRST', 'SORTINGS.PROMO' ];
  public selectedSorting: string;
  public products: Product[] = [];
  public priceFrom: number = 100;
  public priceTo: number = 250000;
  public page:any;
  public settings: Settings;
  public searchTerm: string; // terme de recherche
  public showSuggestions: boolean; // afficher les suggestions de recherche
  public suggestions: any; // var conenant les suggestions de recherche
  private searchTimeout: NodeJS.Timeout; // duree avant de relancer la fonction searchProducts1 un nouvelle fois
  public domWidth: number = window?.innerWidth;
  public usePagination = this.domWidth > 430;
  loadedProductCount: number;
  public unchangedProducts: any;



  constructor(
    public appSettings:AppSettings, private common: CommonMessageService,
    public appService:AppService, private produitService : ProductService,
    public dialog: MatDialog, public translate: TranslateService,
    public domHandlerService: DomHandlerService) {
    this.selectedSorting = this.sortings[0];
  }

  async ngOnInit() {
    this.selectedSorting = this.sortings[0];
    await this.getProducts();
    this.onWindowResize();
    console.log(this.products, this.unchangedProducts)
  }

  public async getProducts(){
    try {
      const productList = await this.produitService.getProductByBest();
      this.products = productList.slice(0, !this.usePagination ? this.viewCount : undefined);
      this.unchangedProducts = productList;
      this.loadedProductCount = this.viewCount;
      console.log("res Produit :::::: ",this.unchangedProducts);
    } catch (error) {
      this.common.errorToast("Une erreur s'est produite lors du chargement de la liste, merci de réessayer")
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    this.sidenavOpen = window.innerWidth >= 960;
    this.domWidth = window.innerWidth;
    this.usePagination = this.domWidth > 430;
    this.viewCol = window.innerWidth < 361 ? 33.3 : 25;
  }

  public changeCount(count){
    this.viewCount = count;
  }

  public changeSorting(sort){
    this.selectedSorting = sort;
    // console.log('Selected sorting changed: ', this.selectedSorting);
    this.sortProducts();
  }

  public changeViewType(viewCol){
    this.viewCol = viewCol;
  }

  public onPageChanged(event){
    this.page = event;
    // this.getProductsByCetegorie(this.selectedCategoryId);
    this.domHandlerService.winScroll(0,0);
  }

  public filterProductsByPrice() {
    this.products = this.unchangedProducts.filter((product) => {
      const price = Number(product.pricePromotion) || Number(product.priceBasic);
      return (price >= Math.min(this.priceFrom, this.priceTo) && price <= Math.max(this.priceFrom, this.priceTo));
    }).slice(0,!this.usePagination ? this.loadedProductCount : undefined);
    this.sortProducts()
  }

onChangePriceFrom() {
  this.filterProductsByPrice();
}

onChangePriceTo() {
  this.filterProductsByPrice();
}

private sortProducts() {
  switch (this.selectedSorting) {
    case 'SORTINGS.LOWEST_FIRST':
      this.products.sort((a, b) => Number(a.priceBasic) - Number(b.priceBasic));
      break;
    case 'SORTINGS.HIGHEST_FIRST':
      this.products.sort((a, b) => Number(b.priceBasic) - Number(a.priceBasic));
      break;
    case 'SORTINGS.PROMO':
      this.products.sort((a, b) => {
        const hasPromotionA = a.pricePromotion && (a.pricePromotion!=a.priceBasic) ? 1 : 0;
        const hasPromotionB = b.pricePromotion && (b.pricePromotion!=b.priceBasic) ? 1 : 0;
        if (hasPromotionA != hasPromotionB) {
          return hasPromotionB - hasPromotionA;
        }
        return a.nom.localeCompare(b.nom);
      });
      console.log(this.products)
      break;
    case 'SORTINGS.MOST_RECENT':
    default:
      this.products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }
}

onSearchChange() {
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }
  //timeout pour déclencher la recherche apres 300ms d'inactivité
  this.searchTimeout = setTimeout(() => {
    this.showSuggestions = this.searchTerm.length >= 1;
    if (this.showSuggestions) {
      this.appService.searchProductsAndCategories(undefined,this.unchangedProducts, this.searchTerm).subscribe(
        results => {
          this.suggestions = results;
        },
        error => {
          console.error('Erreur lors de la recherche: ', error);
          this.suggestions = [];
        }
      );
    } else {
        this.suggestions = [];
    }
  }, 300);
}

onSearchClick(event) {
  event.preventDefault();
  if (this.searchTerm) {
    this.products = this.suggestions.filter((suggestion: any) => suggestion.type === "product")
    .map((suggestion: any) => suggestion.item);
  }
}

selectSuggestion(suggestion: any,type:string): void {
  if(type == 'product'){
    this.searchTerm = suggestion.nom;
    this.products = this.unchangedProducts.filter((product) =>
      product.nom.toLocaleLowerCase().localeCompare(suggestion.nom.toLocaleLowerCase(), 'fr', { sensitivity: 'base' }) === 0
    );
  }else{
    this.searchTerm = suggestion.nom;
  }
  // annuller les suggestions apres la sélection
  this.showSuggestions = false;
}

loadMore(): void {
  const nextIndex = this.products.length + this.viewCount;
  this.loadedProductCount = nextIndex;
  this.products = this.unchangedProducts.slice(0, nextIndex);
}

validateNumberInput(event: KeyboardEvent) {
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'];
  const isNumber = /^[0-9]$/.test(event.key);

  if (!isNumber && !allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
}

validatePasteInput(event: ClipboardEvent) {
  const clipboardData = event.clipboardData?.getData('text');
  if (clipboardData && !/^\d+$/.test(clipboardData)) {
    event.preventDefault();
  }
}


}
