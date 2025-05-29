import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { ProductService } from 'src/app/services/product.service';
import { CampagneService } from 'src/app/services/campagne.service';
import { Product } from 'src/app/models/product.models';
import { SwiperConfigInterface } from 'src/app/theme/components/swiper/swiper.module';
import { AuthenticationService } from 'src/app/services/auth.service';
import { combineLatest, forkJoin, from, map, Observable, of } from 'rxjs';
import { products } from 'src/app/admin/dashboard/dashboard.data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public banners = [];
  public campagnes = [];
  public produit: Array<Product>;
  public ProductByCategorie: Array<Product>;
  public featuredProducts: Array<Product>;
  public onSaleProducts: Array<Product>;
  public topRatedProducts: Array<Product>;
  public newArrivalsProducts: Array<Product>;
  cate:any;
  categories: any;
  promotion:any;
  best:any;
  productNames:any;
  topRateProducts: Product[];
  newArrivals: Product[];
  promoProducts: Product[];
  public ProductConfig: SwiperConfigInterface = { };
  public SubCategoryConfig: SwiperConfigInterface = { };
  subCategories: any [] = [
    { id: 0, name: "Vetements Femme" },
    { id: 1, name: "Telephone" },
    { id: 2, name: "Sacs" },
    { id: 3, name: "Vetement Homme" },
    { id: 4, name: "Montres" },
    { id: 5, name: "Pentalons" },
    { id: 6, name: "Chaussures" }
  ]
  selectedSubCategory: any = this.subCategories[0];
  currentUser: any = null;

  constructor(
    public appService: AppService,
    public produitService: ProductService,
    public campagneService: CampagneService,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.currentUser = this.auth.currentUser();
    


    this.getNewArrivalsProducts();
    this.getTopRatedProducts();
    this.productInPromo();
    // this.listCampagne();
    // this.getAllProduit();
    // this.getBrands();
    // this.getCategorie();
    // this.nomProduits();
  }

  ngAfterViewInit(){
    this.ProductConfig = {
      spaceBetween: 12,
      keyboard: true,
      navigation: false,
      pagination: false,
      grabCursor: true,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 10000
      },
      speed: 2000,
      effect: "slide",
      breakpoints: {
        240: {
          slidesPerView: 2
        },
        480: {
          slidesPerView: 3
        },
        750: {
          slidesPerView: 4
        },
        960: {
          slidesPerView: 5
        }
      }
    }
    this.SubCategoryConfig = {
      spaceBetween: 25,
      keyboard: true,
      navigation: {
        prevEl: ".subcategory-prev",
        nextEl: ".subcategory-next"
      },
      pagination: false,
      loop: false,
      lazy: true,
      effect: "slide",
      breakpoints: {
        240: {
          slidesPerView: 3
        },
        500: {
          slidesPerView: 4
        },
        750: {
          slidesPerView: 5
        },
        960: {
          slidesPerView: 6
        }
      }
    }
  }

  onSubCategoryClick(subCategory:any): void {
    this.selectedSubCategory = subCategory;
  }

  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{
      this.categories = data;
    })
  }

  public async getAllProduit() {
    let res : Array<Product> = await this.produitService.products()
   //  console.log("res product :::::::: ",res)
    this.produit = res;
  }

  public async getProduitByPromotion() {
    this.promotion = await this.produitService.getProductByTop()
    // console.log("res promotion :::::::: ",this.promotion)
  }

  public async getNewArrivals() {
    this.productNames = await this.produitService.getProductByNewArrival(50)
    // console.log("res newArrivals :::::::: ",this.newArrivals)

  }

  public async nomProduits() {
    this.productNames = await this.produitService.nomProduits();
    // console.log("res nomProduits :::::::: ",this.productNames)
  }

  public async getNewArrivalsProducts() {
    const products = await this.produitService.getProductByNewArrival(15);
    // Récupérer les produits likés
    if (this.currentUser) {
      this.produitService.getProduitsLikesByUser(this.currentUser.id).subscribe(likedProducts => {
        this.newArrivalsProducts = products.map(product => {
          let nom = (product.nom).toLowerCase();
          return {
            ...product,
            nom: nom.charAt(0).toUpperCase() + nom.slice(1),
            priceBasic: this.parsePrice(product.priceBasic),
            pricePromotion: this.parsePrice(product.pricePromotion),
            isFavorite: likedProducts.some(liked => liked.id === product.id)
          };
        }).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
      });
    } else {
      this.newArrivalsProducts = products.map(product => {
        let nom = (product.nom).toLowerCase();
        return {
          ...product,
          nom: nom.charAt(0).toUpperCase() + nom.slice(1),
          priceBasic: this.parsePrice(product.priceBasic),
          pricePromotion: this.parsePrice(product.pricePromotion),
          isFavorite: false
        };
      }).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
    }


  }

  async productInPromo() {
    let productPromo = await this.produitService.getproductOnPromo(10);

      if (this.currentUser) {
        this.produitService.getProduitsLikesByUser(this.currentUser.id).subscribe(likedProducts => {
          this.promoProducts = productPromo.map(product => ({
            ...product,
            isFavorite: likedProducts.some(liked => liked.id === product.id)
          }));
        });
      } else {
        this.promoProducts = productPromo.map(product => ({
          ...product,
          isFavorite: false
        }));
      }
    
  }

  public async getTopRatedProducts() {
    const topRated$ = from(this.produitService.getProductByBest()) as Observable<any>;
    const likedIds$ = this.currentUser ? this.produitService.getProduitsLikesByUser(this.currentUser.id)
      .pipe(map(likes => likes.map(l => l.id))) : of([] as number[]);

    // combine and map to the final shape
    combineLatest([topRated$, likedIds$])
      .pipe(
        map(([products, likedIds]) =>
          products.map(product => {
            const raw = product.nom.toLowerCase();
            return {
              ...product,
              nom: raw.charAt(0).toUpperCase() + raw.slice(1),
              priceBasic: this.parsePrice(product.priceBasic),
              pricePromotion: this.parsePrice(product.pricePromotion),
              isFavorite: likedIds.includes(product.id),
            };
          })
        ),
      ).subscribe(list => {
        this.topRateProducts = list;
      });
  }

  parsePrice (price: any) {
    const parsedPrice = parseFloat(price);
    return isNaN(parsedPrice) ? null : parsedPrice;
  }

}
