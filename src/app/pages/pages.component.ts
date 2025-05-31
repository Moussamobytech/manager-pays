import { Component, OnInit, HostListener/*, ViewChild, ChangeDetectorRef, ElementRef*/ } from '@angular/core';
import { Settings, AppSettings } from '../app.settings';
import { SidenavMenuService } from '../theme/components/sidenav-menu/sidenav-menu.service';
import { DomHandlerService } from '../dom-handler.service';
// import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
// import { AppService } from '../app.service';
// import { ProductService } from '../services/product.service';
// import { Category } from '../models/category.models';
// import { Product } from '../models/product.models';
// import { FormControl } from '@angular/forms';
// import { catchError, debounceTime, distinctUntilChanged, map, of, Subject, Subscription, switchMap } from 'rxjs';
// import { CartService } from '../services/carte.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  providers: [ SidenavMenuService ]
})
export class PagesComponent implements OnInit {
  public showBackToTop:boolean = false;
  // public categories:Category[];
  // public category:Category;//categorie selectionnée au  niveau de la bar de recherche
  // public sidenavMenuItems:Array<any>;
  // @ViewChild('sidenav', { static: true }) sidenav:any;
  // @ViewChild('suggestionsList') suggestionsListElement: ElementRef;
  // public produit: any;
  // public AllProduits: Product[] = [];
  // public filterItems = [ '1', '2', '3', '4' ];

  // public sort : any;
  public settings: Settings;
  // public products: Product[] = [];
  // public searchTerm: string = '';

  // private searchSubscription: Subscription | undefined;
  // searchTerm = new FormControl('');
  // suggestions: any[] = [];
  // public showSuggestions: boolean = false;
  // private skipNextSearch = false;

  // totalPanier:any = 0;
  constructor(public appSettings:AppSettings,
              // public appService:AppService,
              // public produitService : ProductService,
              // public sidenavMenuService:SidenavMenuService,
              // public router:Router,
              // public activatedRoute:ActivatedRoute,
              public domHandlerService: DomHandlerService,) {
    this.settings = this.appSettings.settings;
    // this.getCategoriesSidenav()
  }


  async ngOnInit() {
    // let res = await this.appService.getCategoriesSidenav().toPromise()
    // this.sidenavMenuItems = res;
    // this.getAllProduits();
    // this.getCategories();
    // setTimeout(() => {
    //   this.settings.theme = 'fidelity';
    // });

    // this.initializeSearch();
    // document.addEventListener('click', this.onGlobalClick.bind(this));

    // this.cartService.cartCount$.subscribe((count) => {
    //   this.totalPanier = count;
    // });

  }

  // private initializeSearch(): void {
  //   this.searchSubscription = this.searchTerm.valueChanges.pipe(
  //       debounceTime(300),
  //       distinctUntilChanged(),
  //       switchMap(term => {
  //         if (this.skipNextSearch) {
  //           this.skipNextSearch = false;
  //           return of([]); // skip the search
  //         }

  //         this.showSuggestions = term.length >= 1;
  //         return this.showSuggestions
  //             ? this.appService.searchProductsAndCategories(this.categories, this.AllProduits, term)
  //             : of([]);
  //       }),
  //       catchError(error => {
  //           console.error('Search error:', error);
  //           return of([]);
  //       })
  //   ).subscribe(results => {
  //       this.suggestions = results;
  //   });
  // }


  // onGlobalClick(event: MouseEvent): void {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('.search-input')) {
  //     this.showSuggestions = false;
  //   }
  // }
  // selectSuggestion(suggestion: any,type): void {
  //   this.skipNextSearch = true;
  //   this.searchTerm.setValue(suggestion.nom);

  //   if(type == 'product'){
  //     this.router.navigate(['/search-results'], { queryParams: { q: suggestion.nom } });
  //   }else{
  //     this.router.navigate(['/categories/'+suggestion.cle]);
  //   }

  //   this.showSuggestions = false; // Masquer les suggestions après la sélection
  // }

  // public getCategories(){
  //     let deflt: any =  {"nom":"Tous", "cle":"all"}
  //     // this.category = data[0];
  //     this.category = deflt;
  //   this.appService.getCategories().subscribe(data => {
  //     this.categories = data;
  //     // this.router.navigate(['/products']);

  //     data.push({"nom":"Tous", "cle":"all"})
  //     this.appService.Data.categories = data;
  //   });
  // }

  // public async getCategoriesSidenav(){
  //   let res = await this.appService.getCategoriesSidenav().toPromise()
  //   console.log("this.menuItems res :::::: ",res)
  //   this.sidenavMenuItems = res;
  // }

  // public changeCategory(event) {
  //   if (event) {
  //     const selectedCategory = this.categories.find(category => (category.cle === event)||category.id === event);
  //     if (selectedCategory) {
  //       this.category = selectedCategory;
  //       // Naviguer vers la page des produits avec l'ID de la catégorie
  //       this.router.navigate(['/categories', this.category.cle]);
  //     }
  //   }
  //   if (this.domHandlerService.window?.innerWidth < 960) {
  //     this.stopClickPropagate(event);
  //   }
  // }

  // public changeTheme(theme: any){
  //   this.settings.theme = theme;
  // }

  // public stopClickPropagate(event: any){
  //   event.stopPropagation();
  //   event.preventDefault();
  // }


  // public onSearch(event: Event): void {
  //   event.preventDefault();

  //   if (this.searchTerm.value) {
  //     const suggestion = this.suggestions[0]?.item;
  //     const type = this.suggestions[0]?.type;

  //     if (this.suggestions.length === 0 || type === 'product') {
  //       this.router.navigate(['/search-results'], { queryParams: { q: this.searchTerm.value } });
  //     } else {
  //       this.router.navigate(['/categories/' + suggestion.cle]);
  //     }
  //   }

  //   this.showSuggestions = false;
  // }


  // public async getProduit() {
  //   let res : Array<Product> = await this.produitService.products()
  //   console.log("res product :::::::: ",res)
  //   this.produit = res
  //   // this.appService.getAllProducts().subscribe(data => {
  //   //   this.produit = data;
  //   // });
  // }
  public scrollToTop(){
    var scrollDuration = 200;
    var scrollStep = -this.domHandlerService.window?.pageYOffset / (scrollDuration / 20);
    var scrollInterval = setInterval(()=>{
      if(this.domHandlerService.window?.pageYOffset != 0){
        this.domHandlerService.window?.scrollBy(0, scrollStep);
      }
      else{
        clearInterval(scrollInterval);
      }
    },10);
    if(this.domHandlerService.window?.innerWidth <= 768){
      setTimeout(() => {
        this.domHandlerService.winScroll(0, 0);
      });
    }
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    const scrollTop = Math.max(this.domHandlerService.window?.pageYOffset, this.domHandlerService.winDocument.documentElement.scrollTop, this.domHandlerService.winDocument.body.scrollTop);
    let header_toolbar = this.domHandlerService.winDocument.getElementById('header-toolbar');
    if(header_toolbar){
      if(scrollTop >= header_toolbar.clientHeight) {
        this.settings.mainToolbarFixed = true;
      }
      else{
        if(!this.domHandlerService.winDocument.documentElement.classList.contains('cdk-global-scrollblock')){
          this.settings.mainToolbarFixed = false;
        }
      }
    }
    else{
      this.settings.mainToolbarFixed = true;
    }
    ($event.target.documentElement.scrollTop > 300) ? this.showBackToTop = true : this.showBackToTop = false;
  }

  // ngAfterViewInit(){
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd) {
  //       this.sidenav.close();
  //     }
  //   });
  //   this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
  // }

  // public closeSubMenus(){
  //   if(this.domHandlerService.window?.innerWidth < 960){
  //     this.sidenavMenuService.closeAllSubMenus();
  //   }
  // }


  // async getAllProduits() {
  //   try {
  //     this.appService.getAllProducts()
  //     .pipe(
  //       map((products) => products.filter((product) => product.etat !== "INACTIF"))
  //     )
  //     .subscribe((filteredProducts) => {
  //       this.AllProduits = filteredProducts || [];
  //       // console.log("Filtered Products: ", this.AllProduits);
  //     });
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des produits :", error);
  //     this.AllProduits = [];
  //   }
  // }

  // ngOnDestroy(): void {
  //   this.searchSubscription?.unsubscribe();
  //   document.removeEventListener('click', this.onGlobalClick.bind(this));
  // }

  // changeFilter(filterItem:string){

  // }


}
