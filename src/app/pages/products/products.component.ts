import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent } from '../../shared/products-carousel/product-dialog/product-dialog.component';
import { AppService } from '../../app.service';
// import { Products, Category, Brand } from "../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
import { Category } from 'src/app/models/category.models';
import { CommonMessageService } from 'src/app/services/common-message.service';
// import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  public sidenavOpen:boolean = true;
  private sub: any;
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public counts = [12, 24, 36];
  public count:any;
  // public sortings = ['Sort by Default', 'Best match', 'Lowest first', 'Highest first'];
  public sortings = ['SORTINGS.SORT_BY_DEFAULT',  'SORTINGS.LOWEST_FIRST', 'SORTINGS.HIGHEST_FIRST'];
  // public selectedSorting: string = this.sortings[0];
  public selectedSorting: string;
  public sort:any;
  public products: Array<Product> = [];
  public produit : Array<Product>= []
  public productsw : Array<Product>
  public categories:Category[];
  public brands : any;
  public priceFrom: number = 0;
  public priceTo: number = Number.MAX_SAFE_INTEGER;
  public colors = [
    { name: "#5C6BC0", selected: false },
    { name: "#66BB6A", selected: false },
    { name: "#EF5350", selected: false },
    { name: "#BA68C8", selected: false },
    { name: "#FF4081", selected: false },
    { name: "#9575CD", selected: false },
    { name: "#90CAF9", selected: false },
    { name: "#B2DFDB", selected: false },
    { name: "#DCE775", selected: false },
    { name: "#FFD740", selected: false },
    { name: "#00E676", selected: false },
    { name: "#FBC02D", selected: false },
    { name: "#FF7043", selected: false },
    { name: "#F5F5F5", selected: false },
    { name: "#696969", selected: false }
  ];
  public sizes = [
    { name: "S", selected: false },
    { name: "M", selected: false },
    { name: "L", selected: false },
    { name: "XL", selected: false },
    { name: "2XL", selected: false },
    { name: "32", selected: false },
    { name: "36", selected: false },
    { name: "38", selected: false },
    { name: "46", selected: false },
    { name: "52", selected: false },
    { name: "13.3\"", selected: false },
    { name: "15.4\"", selected: false },
    { name: "17\"", selected: false },
    { name: "21\"", selected: false },
    { name: "23.4\"", selected: false }
  ];
  public page:any;
  public settings: Settings;
  tous:any;
  idCat:any;
 public allCategories:any;
  selectedCategoryId: any;
  public produits: Product[];

  categoryId: string;


  constructor(public appSettings:AppSettings, private common: CommonMessageService,
              private activatedRoute: ActivatedRoute,
              public appService:AppService, private produitService : ProductService,
              public dialog: MatDialog,
              public translate: TranslateService,
              private router: Router,
              public domHandlerService: DomHandlerService) {
    this.settings = this.appSettings.settings;
      // Assurez-vous que sortings contient les valeurs correctes
      console.log('Sortings: ', this.sortings);
      this.selectedSorting = this.sortings[0];
      // Vérifiez la valeur de selectedSorting
      console.log('Selected sorting initial: ', this.selectedSorting);


  }

  ngOnInit() {
    this.count = this.counts[0];
    this.sort = this.sortings[0];
    

    // Gérez les fenêtres redimensionnées
    if (this.domHandlerService.window?.innerWidth < 960) {
        this.sidenavOpen = false;
    };
    if (this.domHandlerService.window?.innerWidth < 1280) {
        this.viewCol = 33.3;
    };
    this.priceFrom = 0; // Mettez la valeur par défaut que vous préférez
    this.priceTo = 2000000;

    this.getCategories();
    this.getBrands();
    // this.getProductsByCetegorie(this.selectedCategoryId)

    this.getCategorie();
    // this.AllProduct();
    // this.loadProducts();

    // Abonnez-vous aux paramètres de l'URL
    this.sub = this.activatedRoute.params.subscribe(params => {
      console.log(params['name']);
      this.selectedCategoryId = params['name']
      this.getProductsByCetegorie(this.selectedCategoryId);
    });
  }

  public getProductByCategorie(categoryId: string){
    this.produitService.getProductByCategorie(categoryId).subscribe((data=>{
      this.products = data;
      console.log("productName ::::::::: ",this.products)

    }))
  }
  public async getProductsByCetegorie(categoryId: string){

    try {
      let res = await this.produitService.getProductByCategorieName(categoryId)
      console.log("res Produit :::::: ",res);
      this.products = res;
    } catch (error) {
      this.common.errorToast("Une erreur s'est produite lors du chargement de la liste, merci de réessayer")
    }
    
    
    // this.produitService.getProductByCategorieName(categoryId).subscribe(data=>{
    //   this.products = data;
    //   console.log("Produit ::::: ", this.products)
    //   //for show more product
    //   // for (var index = 0; index < 3; index++) {
    //   //   this.products = this.products.concat(this.products);
    //   // }
    // });
  }

  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{
      this.allCategories = data;
    })
  }
  public getCategories(){
    console.log("this.appService.Data.categories.length ::::: ",this.appService.Data.categories.length);
    
    if(this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.categories = data;
        this.allCategories = data;
        this.appService.Data.categories = data;

      });
    }
    else{
      this.categories = this.appService.Data.categories;
    }
  }


  


  public getBrands(){
    this.appService.getBrands().subscribe(data=>{
      this.brands =data;
      this.brands.forEach(brand => { brand.selected = false });
      console.log("Brands ",data);
    });
    // this.brands.forEach(brand => { brand.selected = false });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  public changeCount(count){
    this.count = count;
    this.getProductsByCetegorie(this.selectedCategoryId);
  }

  public changeSorting(sort){
    this.selectedSorting = sort;
    console.log('Selected sorting changed: ', this.selectedSorting);
    this.sortProducts();
  }

  public changeViewType(viewType, viewCol){
    this.viewType = viewType;
    this.viewCol = viewCol;
  }

  public openProductDialog(product){
    let dialogRef = this.dialog.open(ProductDialogComponent, {
        data: product,
        panelClass: 'product-dialog',
        direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if(product){

        this.router.navigate(['/products', product.id, product.nom]);
      }
    });
  }

  public onPageChanged(event){
    this.page = event;
    // this.getProductsByCetegorie(this.selectedCategoryId);
    this.domHandlerService.winScroll(0,0);
  }


  public onChangeCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.getProductsByCetegorie(categoryId); // Vérifiez cette ligne pour vous assurer que categoryId est correctement passé


    // Recherche du texte de la catégorie en fonction de son ID
    const selectedCategory = this.allCategories.find(category => category.id === categoryId);
    if (selectedCategory) {
        this.router.navigate(['/products', selectedCategory.nom.toLowerCase()]); // Assurez-vous d'utiliser la propriété correcte pour le nom de la catégorie (probablement nom, plutôt que name)
    }
}



AllProduct(){
  this.appService.getAllProducts().subscribe(data=>{
    this.produits = data;
    console.log("Tous les produits", this.produits);
  })
}
filterProductsByPrice() {
  // Filtrer les produits en fonction des prix sélectionnés
  this.products = this.produits.filter(product => {
      const priceBasic = Number(product.priceBasic); // Conversion en number
      if (this.priceFrom <= this.priceTo) {
          return priceBasic >= this.priceFrom && priceBasic <= this.priceTo;
      } else {
          // Inverser les valeurs de priceFrom et priceTo si nécessaire
          return priceBasic >= this.priceTo && priceBasic <= this.priceFrom;
      }
  });
}

onChangePriceFrom() {

    this.filterProductsByPrice();
}

onChangePriceTo() {

    this.filterProductsByPrice();

}

loadProducts() {
  this.appService.getAllProducts().subscribe((data: any[]) => {
    this.products = data;
    this.sortProducts();
  });
}
sortProducts() {
  console.log("::::::::::::::: selectedSorting ", this.selectedSorting);
  switch (this.selectedSorting) {

    // case 'SORTINGS.BEST_MATCH':
    //   console.log("::::::::::::: BEST ");
    //   // Implémentez votre logique de tri pour BEST_MATCH
    //   this.products.sort((a, b)=> Number(a.priceBasic) - Number(a.priceBasic)); // Sorting by highest rating

    //   console.log("::::::::::::: BEST 1 ", this.products);
    //   break;
    case 'SORTINGS.LOWEST_FIRST':
      this.products.sort((a, b) => Number(a.priceBasic) - Number(b.priceBasic));
      console.log("::::::::::::::: lowest ", this.products);
      break;
    case 'SORTINGS.HIGHEST_FIRST':
      this.products.sort((a, b) => Number(b.priceBasic) - Number(a.priceBasic));
      console.log("::::::::::::::: HIGHEST_FIRST ", this.products);
      break;
      case 'SORTINGS.SORT_BY_DEFAULT':
      default:
        this.products.sort((a, b) => Number(b.priceBasic) - Number(a.priceBasic));
        break;
  }
}

}
