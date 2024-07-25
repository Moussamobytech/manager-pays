import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
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
  public produit: any;
  public AllProduits: Product[] = [];
  public produits: Product[] = [];

  public sort : any;
  public settings: Settings;
  public products: Product[] = [];
  public searchTerm: string = '';

  constructor(public appSettings:AppSettings,
              public appService:AppService,
              public produitService : ProductService,
              public sidenavMenuService:SidenavMenuService,
              public router:Router,
              public domHandlerService: DomHandlerService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.getCategories();
    this.sidenavMenuItems = this.sidenavMenuService.getSidenavMenuItems();
    setTimeout(() => {
      this.settings.theme = 'fidelity';
      // this.settings.theme = 'green';
    });
    // this.getAllProduit();


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
        console.log("Selected category:", this.category);
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


  public changeTheme(theme){
    this.settings.theme = theme;
  }

  public stopClickPropagate(event: any){
    event.stopPropagation();
    event.preventDefault();
  }


  public onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchTerm) {
      console.log(":::::::::searchTerm ",this.searchTerm)
      this.router.navigate(['/search-results'], { queryParams: { q: this.searchTerm } });
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
      this.produitService.getAllProducts().subscribe(produits => {
        this.AllProduits = produits || [];
        this.produits = this.AllProduits;
        this.produits.sort = this.sort;
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
      this.AllProduits = [];
      this.produits = [];
    }
  }


}
