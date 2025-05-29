import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Category } from 'src/app/models/category.models';
import { Product } from 'src/app/models/product.models';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CommonService } from 'src/app/services/common.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-promo',
  templateUrl: './promo.component.html',
  styleUrls: ['./promo.component.scss']
})
export class PromoComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  @ViewChild('suggestionsContainer', { static: false }) suggestionsContainer!: ElementRef;

  public sidenavOpen = true;
  public viewCol = 25;//pourcentage du fxflex de chaque produit
  public viewCount: number = 8; // nombre de produits à charger après chaque clic sur <charger plus>
  public sortings = [ 'SORTINGS.MOST_RECENT', 'SORTINGS.LOWEST_FIRST', 'SORTINGS.HIGHEST_FIRST', 'SORTINGS.PROMO' ];
  public selectedSorting: string;//sorting selectionné
  public products: Product[] = [];// produits apres tous les filtres et sortings
  public unchangedProducts: Product[] = [];// produits jamais filtrés
  public priceFrom = 100;//prix min de filtre
  public priceTo = 250000;
  public usedCategories: Category[] = []; // categories des produits
  public checkedCategories: string[] = []; // categories selectionnées par l'utilisateur
  public isAllBoxSelected = false;  // true si toutes les catégories sont selectionnées/ false sinon
  public page: number;
  public searchTerm: string;// terme de recherche
  public showSuggestions: boolean;// afficher les suggestions de recherche
  public suggestions: any;// var conenant les suggestions de recherche
  private searchTimeout: NodeJS.Timeout; // duree avant de relancer la fonction searchProducts1 un nouvelle fois
  domWidth: number = window?.innerWidth;
  loadedProductCount:number; // nombre de produit actuellement chargee
  public usePagination = this.domWidth > 430; // basculer entre la pagination et le Voir plus
  promoProducts: Product[];
  currentUser: any = null;

  constructor(
    private common: CommonMessageService,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private produitService: ProductService,
    public domHandlerService: DomHandlerService,
    private cm: CommonService,
  ) {
    this.selectedSorting = this.sortings[0];
  }

  async ngOnInit() {
    this.sortProducts();
   // this.productInPromo();
    this.getDataFromBackend();
    this.onWindowResize();
  }

  public async getDataFromBackend() {
    try {
       // await this.getProducts();
      await this.productInPromo();
      this.getCategories();
    } catch (error) {
      this.common.errorToast(
        "Une erreur s'est produite lors du chargement. Merci de réessayer."
      );
    }
  }
 

 /* private async getProducts() {
    const products = await this.produitService.getProductByBest();

    const filteredProducts = products.filter((p) => p.etat === "ACTIF");
    this.products = filteredProducts.slice(0, !this.usePagination ? this.viewCount : undefined);
    this.unchangedProducts = filteredProducts;
    this.loadedProductCount = this.viewCount;
  }*/
  

  private async productInPromo() {
    let productPromo = await this.produitService.getproductOnPromo(50);
    console.log("::: PRODUCT PROMO :::",productPromo);


      if (this.currentUser) {
        this.produitService.getProduitsLikesByUser(this.currentUser.id).subscribe(likedProducts => {
          this.products = productPromo.map(product => ({
            ...product,
            isFavorite: likedProducts.some(liked => liked.id === product.id)
          }));
        });
      } else {
        this.products = productPromo.map(product => ({
          ...product,
          isFavorite: false
        }));
      }
  
  }
 
  private getCategories() {
    this.appService.getCategories().subscribe((categories) => {
      console.log(":::::::: ALL CATT = ",categories);
      
      const productCategoriesId = Array.from(
        new Set(this.products.map((product) => product.categorie))
      );
      console.log(":::::::: PROD CATT = ",productCategoriesId);

      this.usedCategories = categories.filter((category) =>
        productCategoriesId.includes(category.id)
      );

      console.log(":::::::: USED CATT = ",this.usedCategories);


      this.checkedCategories = this.usedCategories.map((category) => category.id);
      this.updateAllBoxSelection();
    });
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.sidenavOpen = window.innerWidth >= 960;
    this.domWidth = window.innerWidth;
    this.usePagination = this.domWidth > 430;
    this.viewCol = window.innerWidth < 361 ? 33.3 : 25;
  }

  public changeCount(count: number) {
    this.viewCount = count;
  }

  public changeSorting(sort: string) {
    this.selectedSorting = sort;
    this.sortProducts();
  }

  public changeViewType( viewCol: number) {
    this.viewCol = viewCol;
  }

  public onPageChanged(event: number) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public async onCategoryChange(isChecked: boolean, categoryId: string) {
    if (isChecked) {
      this.checkedCategories.push(categoryId);
    } else {
      this.checkedCategories = this.checkedCategories.filter((id) => id !== categoryId);
    }
    this.filterProductsByCheckedCategories();
    this.updateAllBoxSelection();
  }

  public async toggleAllCategories(isChecked: boolean) {
    this.checkedCategories = isChecked? this.usedCategories.map((category) => category.id) : [];
    this.updateAllBoxSelection();
    await this.filterProductsByCheckedCategories();
  }

  private updateAllBoxSelection() {
    this.isAllBoxSelected = this.checkedCategories.length === this.usedCategories.length;
  }

  private async filterProductsByCheckedCategories() {
    if (this.checkedCategories.length === 0) {
      this.products = [];
      return;
    }

    this.products = this.unchangedProducts.filter((product) =>
      this.checkedCategories.some((categoryId) =>
        product.categorieNom.includes(
          this.usedCategories.find((category) => category.id === categoryId)?.nom
        )
      )
    ).slice(0,!this.usePagination ? this.loadedProductCount : undefined);
  }

  public filterProductsByPrice() {
    console.log(this.priceFrom,this.priceTo);
    this.products = this.unchangedProducts.filter((product) => {
      const price = Number(product.pricePromotion) || Number(product.priceBasic);
      return (price >= Math.min(this.priceFrom, this.priceTo) && price <= Math.max(this.priceFrom, this.priceTo));
    }).slice(0,!this.usePagination ? this.loadedProductCount : undefined);
    this.sortProducts()
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
        this.appService.searchProductsAndCategories(this.usedCategories, this.unchangedProducts, this.searchTerm).subscribe(
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
      this.checkedCategories = Array.from(
        new Set(this.products.map((product) => product.categorie))
      );
      this.updateAllBoxSelection();
    }else{
      this.searchTerm = suggestion.nom;
      this.checkedCategories = [suggestion.id];
      this.updateAllBoxSelection();
      this.filterProductsByCheckedCategories();
    }
    // annuller les suggestions apres la sélection
    this.showSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.suggestionsContainer && !this.suggestionsContainer.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  loadMore(): void {
    const nextIndex = this.products.length + this.viewCount;
    this.loadedProductCount = nextIndex;
    this.products = this.unchangedProducts.slice(0, nextIndex);
  }

  validateNumberPrice(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'];
    const isNumber = /^[0-9]$/.test(event.key);
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validatePastePrice(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData && !/^\d+$/.test(clipboardData)) {
      event.preventDefault();
    }
  }

}
