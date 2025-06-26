import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, Subscription, switchMap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Category } from 'src/app/models/category.models';
import { Product } from 'src/app/models/product.models';
import { CartService } from 'src/app/services/carte.service';
import { ProductService } from 'src/app/services/product.service';
import { SidenavMenuService } from 'src/app/theme/components/sidenav-menu/sidenav-menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // public showBackToTop:boolean = false;
    public categories: Category[];
    public navCategories: Category[];
    public category:Category;//categorie selectionnée au  niveau de la bar de recherche
    public sidenavMenuItems:Array<any>;
    // @ViewChild('sidenav', { static: true }) sidenav:any;
    // @ViewChild('suggestionsList') suggestionsListElement: ElementRef;
    public produit: any;
    public AllProduits: Product[] = [];
    public filterItems = [ '1', '2', '3', '4' ];

    public sort : any;
    // public settings: Settings;
    public products: Product[] = [];

    private searchSubscription: Subscription | undefined;
    searchTerm = new FormControl('');
    suggestions: any[] = [];
    public showSuggestions: boolean = false;
    private skipNextSearch = false;

    totalPanier:any = 0;
    constructor(
                // public appSettings:AppSettings,
                public appService:AppService,
                public produitService : ProductService,
                public sidenavMenuService:SidenavMenuService,
                public router:Router,
                public activatedRoute:ActivatedRoute,
                public domHandlerService: DomHandlerService,
                private cartService:CartService,
                // private cdRef: ChangeDetectorRef
              ) {
      // this.settings = this.appSettings.settings;
      this.getCategoriesSidenav()
    }


    async ngOnInit() {
      this.getAllProduits();
      this.getCategories();
      // setTimeout(() => {
      //   this.settings.theme = 'fidelity';
      // });

      this.initializeSearch();
      document.addEventListener('click', this.onGlobalClick.bind(this));

      this.cartService.cartCount$.subscribe((count) => {
        this.totalPanier = count;
      });

    }

    private initializeSearch(): void {
      this.searchSubscription = this.searchTerm.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(term => {
            if (this.skipNextSearch) {
              this.skipNextSearch = false;
              return of([]); // skip the search
            }

            this.showSuggestions = term.length >= 1;
            return this.showSuggestions
                ? this.appService.searchProductsAndCategories(this.categories, this.AllProduits, term)
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
      if (!target.closest('.search-input')) {
        this.showSuggestions = false;
      }
    }
    selectSuggestion(suggestion: any,type): void {
      this.skipNextSearch = true;
      this.searchTerm.setValue(suggestion.nom);

      if(type == 'product'){
        this.router.navigate(['/search-results'], { queryParams: { q: suggestion.nom } });
      }else{
        this.router.navigate(['/categories/'+suggestion.cle]);
      }

      this.showSuggestions = false; // Masquer les suggestions après la sélection
    }

    public getCategories(){
      let deflt: any =  {"nom":"Tous", "cle":"all"}
      this.category = deflt;
      this.appService.getCategories().subscribe(data => {
       
        const parsePoids = (val: any): number => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };
        this.categories = data.filter(cat => cat.status === 'ACTIF');
        // const mainCats = this.categories.filter(cat => cat.parentId == null);
        this.navCategories = this.categories.sort((a, b) => parsePoids(b.poids) - parsePoids(a.poids)).slice(0, (window.innerWidth > 600)?7:5);
        // this.navCategories = mainCats.sort((a, b) => parsePoids(b.poids) - parsePoids(a.poids)).slice(0, (window.innerWidth > 600)?7:5);
        console.log("this.navCategories", this.navCategories);
        
        data.push({"nom":"Tous", "cle":"all"})
        this.appService.Data.categories = data;
      });
    }

    public async getCategoriesSidenav(){
      let res = await this.appService.getCategoriesSidenav().toPromise()
      console.log("this.menuItems res :::::: ",res)
      this.sidenavMenuItems = res;
      // console.log("this.menuItems :::::: ",this.sidenavMenuItems)
    }

    public changeCategory(event) {
      if (event) {
        const selectedCategory = this.categories.find(category => (category.cle === event)||category.id === event);
        if (selectedCategory) {
          this.category = selectedCategory;
          // Naviguer vers la page des produits avec l'ID de la catégorie
          this.router.navigate(['/categories', this.category.cle]);
        }
      }
      if (this.domHandlerService.window?.innerWidth < 960) {
        this.stopClickPropagate(event);
      }
    }

    public stopClickPropagate(event: any){
      event.stopPropagation();
      event.preventDefault();
    }


    public onSearch(event: Event): void {
      event.preventDefault();

      if (this.searchTerm.value) {
        const suggestion = this.suggestions[0]?.item;
        const type = this.suggestions[0]?.type;

        if ((this.suggestions as any).hasLowScoreProducts) {
          this.appService.searchNotFoundTerme(this.searchTerm.value.trim())
            .subscribe(response => {
              console.log('searchNotFoundTerme response:', response);
            });
        }

        if (this.suggestions.length === 0 || type === 'product') {
          this.router.navigate(['/search-results'], { queryParams: { q: this.searchTerm.value } });
        } else {
          this.router.navigate(['/categories/' + suggestion.cle]);
        }
      }

      this.showSuggestions = false;
    }

    // ngAfterViewInit(){
    //   this.router.events.subscribe(event => {
    //     if (event instanceof NavigationEnd) {
    //       this.sidenav.close();
    //     }
    //   });
    //   this.sidenavMenuService.expandActiveSubMenu(this.sidenavMenuService.getSidenavMenuItems());
    // }

    public closeSubMenus(){
      if(this.domHandlerService.window?.innerWidth < 960){
        this.sidenavMenuService.closeAllSubMenus();
      }
    }


    async getAllProduits() {
      try {
        this.appService.getAllProducts()
        .pipe(
          map((products) => products.filter((product) => product.etat !== "INACTIF"))
        )
        .subscribe((filteredProducts) => {
          this.AllProduits = filteredProducts || [];
          // console.log("Filtered Products: ", this.AllProduits);
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

    changeFilter(filterItem:string){

    }

}
