import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
import { Category } from 'src/app/models/category.models';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';
import { map, tap } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
})
export class SellerComponent implements OnInit {

  @ViewChild('sidenav', { static: true }) sidenav: any;
  @ViewChild('suggestionsContainer', { static: false }) suggestionsContainer!: ElementRef;

  public sidenavOpen = true;
  public viewCol = 25;//pourcentage du fxflex de chaque produit
  public viewCount: number = 8; // nombre de produits à charger après chaque clic sur <charger plus>
  public sortings = [ 'SORTINGS.MOST_RECENT', 'SORTINGS.LOWEST_FIRST', 'SORTINGS.HIGHEST_FIRST', 'SORTINGS.PROMO' ];
  public selectedSorting: string;//sorting selectionné
  public sellerProducts: Product[] = [];// produits du vendeur apres tous les filtres et sortings
  public unchangedSellerProducts: Product[] = [];// produits du vendeur jamais filtrés
  public priceFrom = 100;//prix min de filtre
  public priceTo = 250000;
  public sellerId: string;
  public usedCategories: Category[] = [];//categories des produits du vendeur
  public checkedCategories: string[] = [];//categories selectionnées par l'utilisateur
  public isAllBoxSelected = false;  // true si toutes les catégories sont selectionnées/ false sinon
  public page: number;
  public searchTerm: string;// terme de recherche
  public showSuggestions: boolean;// afficher les suggestions de recherche
  public suggestions: any;// var conenant les suggestions de recherche
  private searchTimeout: NodeJS.Timeout; // duree avant de relancer la fonction searchProducts1 un nouvelle fois
  public sellerInfo: any;
  public imgsLink: string="https://image.geotrac.io/minio/api/v1/view?bucket=ecommerce-bucket&file=";
  public isCopied: boolean = false;
  public shopLink: string = null;
  public sellerBanners:any[];
  domWidth: number = window?.innerWidth;
  loadedProductCount:number; // nombre de produit actuellement chargee
  public usePagination = this.domWidth > 430; // basculer entre la pagination et le Voir plus


  constructor(
    public appSettings: AppSettings,
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
    this.activatedRoute.params.subscribe((params) => {
      this.sellerId = params['name'];
      if(this.sellerId.length <= 8){
        this.cm.goTo("/");
      }else{
        this.getDataFromBackend();
        this.shopLink = "https://fidelity-market.com/#/sellers/"+this.sellerId;
      }
    });
    this.onWindowResize();
  }

  public async getDataFromBackend() {
    try {
      this.getSeller();
      this.getProducts().subscribe(()=>{
        this.getCategories();
      });
    } catch (error) {
      this.common.errorToast(
        "Une erreur s'est produite lors du chargement. Merci de réessayer."
      );
    }
  }

  private getSeller() {
    this.appService.infoSeller(this.sellerId).subscribe(
      (infoS)=>{
        this.sellerInfo = infoS;
        this.sellerBanners = [
          (this.sellerInfo.bg1)?{ image: this.imgsLink+this.sellerInfo.bg1}:null,
          (this.sellerInfo.bg2)?{ image: this.imgsLink+this.sellerInfo.bg2}:null,
          (this.sellerInfo.bg3)?{ image: this.imgsLink+this.sellerInfo.bg3}:null,
        ].filter((item)=>item!=null);
        if(!this.sellerInfo?.nom){
          this.cm.goTo("/sellers/denied/not-allowed");
        }
      },
      (error)=>{
        if(error.status==400){
          this.cm.goTo('/');
        }
      }
    );
  }

  private getProducts() {
    return this.produitService.getProductBySeller(this.sellerId).pipe(
      map((p)=>p.filter((p)=>p.etat=="ACTIF")),
      tap((products) => {
        this.sellerProducts = products.slice(0, !this.usePagination ? this.viewCount : undefined);
        this.unchangedSellerProducts = products;
        this.loadedProductCount = this.viewCount;
        console.log(this.usePagination)
        console.log(this.sellerProducts.length)
      })
    );
  }

  private getCategories() {
    this.appService.getCategories().subscribe((categories) => {
      const productCategoriesId = Array.from(
        new Set(this.sellerProducts.map((product) => product.categorie))
      );
      this.usedCategories = categories.filter((category) =>
        productCategoriesId.includes(category.id)
      );

      this.checkedCategories = this.usedCategories.map((category) => category.id);
      this.updateAllBoxSelection();
    });
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.sidenavOpen = window.innerWidth >= 960;
    this.usePagination = this.domWidth > 430;
    this.viewCol = window.innerWidth < 350 ? 33.3 : 25;
    this.domWidth = window.innerWidth;
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
      this.sellerProducts = [];
      return;
    }

    this.sellerProducts = this.unchangedSellerProducts.filter((product) =>
      this.checkedCategories.some((categoryId) =>
        product.categorieNom.includes(
          this.usedCategories.find((category) => category.id === categoryId)?.nom
        )
      )
    ).slice(0,!this.usePagination ? this.loadedProductCount : undefined);
  }

  public filterProductsByPrice() {
    this.sellerProducts = this.unchangedSellerProducts.filter((product) => {
      const price = Number(product.pricePromotion) || Number(product.priceBasic);
      return (price >= Math.min(this.priceFrom, this.priceTo) && price <= Math.max(this.priceFrom, this.priceTo));
    }).slice(0,!this.usePagination ? this.loadedProductCount : undefined);
    this.sortProducts()
  }

  private sortProducts() {
    switch (this.selectedSorting) {
      case 'SORTINGS.LOWEST_FIRST':
        this.sellerProducts.sort((a, b) => Number(a.priceBasic) - Number(b.priceBasic));
        break;
      case 'SORTINGS.HIGHEST_FIRST':
        this.sellerProducts.sort((a, b) => Number(b.priceBasic) - Number(a.priceBasic));
        break;
      case 'SORTINGS.PROMO':
        this.sellerProducts.sort((a, b) => {
          const hasPromotionA = a.pricePromotion && (a.pricePromotion!=a.priceBasic) ? 1 : 0;
          const hasPromotionB = b.pricePromotion && (b.pricePromotion!=b.priceBasic) ? 1 : 0;
          if (hasPromotionA != hasPromotionB) {
            return hasPromotionB - hasPromotionA;
          }
          return a.nom.localeCompare(b.nom);
        });
        console.log(this.sellerProducts)
        break;
      case 'SORTINGS.MOST_RECENT':
      default:
        this.sellerProducts.sort(
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
        this.appService.searchProducts1(this.usedCategories, this.unchangedSellerProducts, this.searchTerm).subscribe(
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
      this.sellerProducts = this.suggestions.filter((suggestion: any) => suggestion.type === "product")
      .map((suggestion: any) => suggestion.item);
    }
  }

  selectSuggestion(suggestion: any,type:string): void {
    if(type == 'product'){
      this.searchTerm = suggestion.nom;
      this.sellerProducts = this.unchangedSellerProducts.filter((product) =>
        product.nom.toLocaleLowerCase().localeCompare(suggestion.nom.toLocaleLowerCase(), 'fr', { sensitivity: 'base' }) === 0
      );
      this.checkedCategories = Array.from(
        new Set(this.sellerProducts.map((product) => product.categorie))
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

  copyLink(inputElement: HTMLInputElement): void {
    inputElement.style.transition = '.3s';
    navigator.clipboard.writeText(this.shopLink).then(
      () => {
        this.isCopied = true;
        setTimeout(() => (this.isCopied = false), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }

  shareLink(){
    const shareData = {
      title: 'Découvrez cette boutique sur Fidelity-Market 💥!',
      text: 'Discover incredible discounts and offers at the shop '+this.sellerInfo.nom+' !',
      url: this.shopLink
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((error) => console.error('Erreur lors de l\'envoie: ', error));
    } else {
      this.cm.openWarningSnackBar("Le partage n'est pas pris en charge par votre navigateur.")
    }
  }

  loadMore(): void {
    const nextIndex = this.sellerProducts.length + this.viewCount;
    this.loadedProductCount = nextIndex;
    this.sellerProducts = this.unchangedSellerProducts.slice(0, nextIndex);
  }
}
