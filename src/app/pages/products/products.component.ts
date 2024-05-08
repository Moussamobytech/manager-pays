import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent } from '../../shared/products-carousel/product-dialog/product-dialog.component';
import { AppService } from '../../app.service';
import { Product, Category, Brand } from "../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';

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
  public   sortings = ['SORTINGS.SORT_BY_DEFAULT', 'SORTINGS.BEST_MATCH', 'SORTINGS.LOWEST_FIRST', 'SORTINGS.HIGHEST_FIRST'];
  public sort:any;
  public products: Array<Product> = [];
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


  constructor(public appSettings:AppSettings,
              private activatedRoute: ActivatedRoute,
              public appService:AppService,
              public dialog: MatDialog,
              public translate: TranslateService,
              private router: Router,
              public domHandlerService: DomHandlerService) {
    this.settings = this.appSettings.settings;


  }

  ngOnInit() {
      this.count = this.counts[0];
    this.sort = this.sortings[0];

    // Abonnez-vous aux paramètres de l'URL
    this.sub = this.activatedRoute.params.subscribe(params => {
        // Vérifiez s'il y a un paramètre de catégorie dans l'URL
        if (params['name']) {
            // S'il y a un paramètre de catégorie, chargez les produits de cette catégorie
            // En utilisant le nom de la catégorie dans les paramètres de l'URL
            this.selectedCategoryId = params['name'];
            this.getProductsByCetegorie(this.selectedCategoryId);
        } else {
            // S'il n'y a pas de paramètre de catégorie dans l'URL, chargez les produits de la première catégorie
            // de votre liste de catégories
            if (this.allCategories && this.allCategories.length > 0) {
                this.selectedCategoryId = this.allCategories[0].id; // Sélectionnez le premier ID de catégorie
                this.getProductsByCetegorie(this.selectedCategoryId); // Chargez les produits de cette catégorie
            }
        }
    });

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
    this.getCategorie();
    this.AllProduct();
    // this.count = this.counts[0];
    // this.sort = this.sortings[0];
    // this.sub = this.activatedRoute.params.subscribe(params => {
    //   //console.log(params['name']);
    // });
    // if(this.domHandlerService.window?.innerWidth < 960){
    //   this.sidenavOpen = false;
    // };
    // if(this.domHandlerService.window?.innerWidth < 1280){
    //   this.viewCol = 33.3;
    // };

    // this.getCategories();
    //  this.getBrands();
    // this.getProductsByCetegorie(this.selectedCategoryId);
    // this.getCategorie();
    // // this.filterProductsByPrice(this.products);

    // this.priceFrom = 0; // Mettez la valeur par défaut que vous préférez
    // this.priceTo = 200000; // Mettez la valeur par défaut que vous préférez
    // this.AllProduct();
  }

  public getProductsByCetegorie(categoryId: string){
    this.appService.getProductByCategorie(categoryId).subscribe(data=>{
      this.products = data;
      // this.filterProductsByPrice();

      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }

  public getCategories(){
    if(this.appService.Data.categories.length == 0) {
      this.appService.getCategories().subscribe(data => {
        this.categories = data;
        this.appService.Data.categories = data;

      });
    }
    else{
      this.categories = this.appService.Data.categories;


    }
  }


  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{
      this.allCategories = data;
    })
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
    this.sort = sort;
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
      // Vérifier si priceFrom est inférieur à priceTo
      if (this.priceFrom <= this.priceTo) {
          return product.priceBasic >= this.priceFrom && product.priceBasic <= this.priceTo;
      } else {
          // Inverser les valeurs de priceFrom et priceTo si nécessaire
          return product.priceBasic >= this.priceTo && product.priceBasic <= this.priceFrom;
      }
  });
}
onChangePriceFrom() {

    this.filterProductsByPrice();
}

onChangePriceTo() {

    this.filterProductsByPrice();

}


// onChangePriceFrom() {
//   console.log('Price from changed to: ', this.priceFrom);
//   this.filterProductsByPrice();
// }

// onChangePriceTo() {
//   console.log('Price to changed to: ', this.priceTo);
//   this.filterProductsByPrice();
// }

}
