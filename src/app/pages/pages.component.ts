import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Settings, AppSettings } from '../app.settings';
import { AppService } from '../app.service';
// import { Category, Product } from '../app.models';
import { SidenavMenuService } from '../theme/components/sidenav-menu/sidenav-menu.service';
import { DomHandlerService } from '../dom-handler.service';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../services/product.service';
import { Category } from '../models/category.models';
import { Product } from '../models/product.models';
import { FormControl } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  providers: [ SidenavMenuService ]
})
export class PagesComponent implements OnInit {
  public showBackToTop:boolean = false;
  public categories:Category[];
  public category:Category;
  public sidenavMenuItems:Array<any>;
  @ViewChild('sidenav', { static: true }) sidenav:any;
  @ViewChild('suggestionsList') suggestionsListElement: ElementRef;
  public produit: any;
  public AllProduits: Product[] = [];
  // public produits: Product[] = [];

  public sort : any;
  public settings: Settings;
  public products: Product[] = [];
  // public searchTerm: string = '';

  private searchSubscription: Subscription | undefined;
  searchTerm = new FormControl('');
  suggestions: any[] = [];
  public showSuggestions: boolean = false;
  public clickOutsideSubject = new Subject<Event>();

  constructor(public appSettings:AppSettings,
              public appService:AppService,
              public produitService : ProductService,
              public sidenavMenuService:SidenavMenuService,
              public router:Router,
              public domHandlerService: DomHandlerService,
              private cdRef: ChangeDetectorRef) {
    this.settings = this.appSettings.settings;
    this.getCategoriesSidenav()
  }


  async ngOnInit() {
    // this.getCategoriesSidenav();
    let res = await this.appService.getCategoriesSidenav().toPromise()
    this.getAllProduit();
    // console.log("this.menuItems res :::::: ",res)
    this.sidenavMenuItems = res;
    this.getCategories();
    setTimeout(() => {
      this.settings.theme = 'fidelity';
      // this.settings.theme = 'green';
    });

    this.initializeSearch();
    document.addEventListener('click', this.onGlobalClick.bind(this));
  }

  private initializeSearch(): void {
    this.searchSubscription = this.searchTerm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
            this.showSuggestions = term.length >= 1;
            return this.showSuggestions
                ? this.appService.searchProducts1(this.categories, this.AllProduits, term)
                : of([]);
        }),
        catchError(error => {
            console.error('Search error:', error);
            return of([]);
        })
    ).subscribe(results => {
        this.suggestions = results;
    });
  }


  onGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.suggestions') && !target.closest('.search-input')) {
      this.showSuggestions = false;
    }
  }
  selectSuggestion(suggestion: any,type): void {
    this.searchTerm.setValue(suggestion.nom);
    if(type == 'product'){
      this.router.navigate(['/search-results'], { queryParams: { q: suggestion.nom } });
    }else{
      this.router.navigate(['/products/'+suggestion.cle]);
    }
    this.showSuggestions = false; // Masquer les suggestions après la sélection
  }

  onClickOutside(): void {
    this.showSuggestions = false; // Masquer les suggestions lorsque l'utilisateur clique à l'extérieur
  }

  public getCategories(){
      let deflt: any =  {"nom":"Tous", "cle":"all"}
      // this.category = data[0];
      this.category = deflt;
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      // this.router.navigate(['/products']);

      data.push({"nom":"Tous", "cle":"all"})
      this.appService.Data.categories = data;
    })
  }

  public async getCategoriesSidenav(){

    let res = await this.appService.getCategoriesSidenav().toPromise()
    console.log("this.menuItems res :::::: ",res)
    this.sidenavMenuItems = res;
  }

  // public changeCategory(event) {
  //   if (event.target) {
  //     this.category = this.categories.find(category => category.nom === event.target.innerText);
  //     console.log("Ma cat ", this.category)
  //     if (this.category) {
  //       this.router.navigate(['/products', this.category]); // Navigate to products page with category ID
  //     }
  //   }
  //   if (this.domHandlerService.window?.innerWidth < 960) {
  //     this.stopClickPropagate(event);
  //   }
  // }
  public changeCategory(event) {
    if (event.target) {
      const selectedCategory = this.categories.find(category => category.nom === event.target.innerText);
      if (selectedCategory) {
        this.category = selectedCategory;
        this.router.navigate(['/products', this.category.nom]); // Naviguer vers la page des produits avec l'ID de la catégorie
      }
    }
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.stopClickPropagate(event);
    }
  }

  // public changeCategory(event){
  //   if(event.target){
  //     this.category = this.categories.filter(category => category.nom == event.target.innerText)[0];
  //   }
  //   if(this.domHandlerService.window?.innerWidth < 960){
  //     this.stopClickPropagate(event);
  //   }
  // }

  public remove(product) {
      const index: number = this.appService.Data.cartList.indexOf(product);
      if (index !== -1) {
          this.appService.Data.cartList.splice(index, 1);
          this.appService.Data.totalPrice = this.appService.Data.totalPrice - product.newPrice*product.cartCount;
          this.appService.Data.totalCartCount = this.appService.Data.totalCartCount - product.cartCount;
          this.appService.resetProductCartCount(product);
      }
  }

  public clear(){
    this.appService.Data.cartList.forEach(product=>{
      this.appService.resetProductCartCount(product);
    });
    this.appService.Data.cartList.length = 0;
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;
  }


  public changeTheme(theme: any){
    this.settings.theme = theme;
  }

  public stopClickPropagate(event: any){
    event.stopPropagation();
    event.preventDefault();
  }


  public onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchTerm) {
      console.log(":::::::::searchTerm ",this.searchTerm.value)
      this.router.navigate(['/search-results'], { queryParams: { q: this.searchTerm.value } });

    }
  }


  public async getProduit() {
    let res : Array<Product> = await this.produitService.products()
    console.log("res product :::::::: ",res)
    this.produit = res
    // this.appService.getAllProducts().subscribe(data => {
    //   this.produit = data;
    // });
  }
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

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.sidenav.close();
      }
    });
    this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
  }

  public closeSubMenus(){
    if(this.domHandlerService.window?.innerWidth < 960){
      this.sidenavMenuService.closeAllSubMenus();
    }
  }


  async getAllProduit() {
    try {
      this.appService.getAllProducts().subscribe((produits: any) => {
        this.AllProduits = produits || [];
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
      this.AllProduits = [];
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    document.removeEventListener('click', this.onGlobalClick.bind(this));
  }

  // async getAllProduit() {
  //   try {
  //     this.produitService.getAllProducts().subscribe(produits => {
  //       this.AllProduits = produits || [];
  //       this.produits = this.AllProduits;
  //       this.produits.sort = this.sort;
  //     });
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération des produits :", error);
  //     this.AllProduits = [];
  //     this.produits = [];
  //   }
  // }


}
