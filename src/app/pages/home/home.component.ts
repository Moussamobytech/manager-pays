import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

import { ProductService } from 'src/app/services/product.service';
import { CampagneService } from 'src/app/services/campagne.service';
import { Product } from 'src/app/models/product.models';
import { SwiperConfigInterface } from 'src/app/theme/components/swiper/swiper.module';

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
  subCategories: string [] = ['Vetements Femme','Telephone', 'Sacs', 'Vetement Homme', 'Montres', 'Pentalons', 'Chaussures'];

  constructor(public appService:AppService, public produitService : ProductService, public campagneService : CampagneService) { }

  ngOnInit() {
    this.getNewArrivalsProducts();
    this.getTopRatedProducts();
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

  public getCategorie(){
    this.appService.getCategories().subscribe(data =>{
      this.categories = data;
    })
  }

  public async getAllProduit() {
    let res : Array<Product> = await this.produitService.products()
    // console.log("res product :::::::: ",res)
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
    const products = await this.produitService.getProductByTop();
    this.newArrivalsProducts = products.map(product => {
      let nom = (product.nom).toLowerCase();
      return {
        ...product,
        nom: nom.charAt(0).toUpperCase() + nom.slice(1),
        priceBasic: this.parsePrice(product.priceBasic),
        pricePromotion: this.parsePrice(product.pricePromotion),
      };
    }).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

    this.promoProducts = products
    .map(product => {
      let nom = (product.nom).toLowerCase();
      return {
        ...product,
        nom: nom.charAt(0).toUpperCase() + nom.slice(1),
        priceBasic: this.parsePrice(product.priceBasic),
        pricePromotion: this.parsePrice(product.pricePromotion),
      };
    })
    .filter(product => (product.pricePromotion !== null)&&(product.pricePromotion < product.priceBasic));
    console.log("promo: ",this.promoProducts)
  }


  public async getTopRatedProducts() {
    const products = await this.produitService.getProductByBest();
    this.topRateProducts = products.map((product:Product) => {
      let nom = (product.nom).toLowerCase();
      return {
        ...product,
        nom: nom.charAt(0).toUpperCase() + nom.slice(1),
        priceBasic: this.parsePrice(product.priceBasic),
        pricePromotion: this.parsePrice(product.pricePromotion),
      };
    });
  }

  parsePrice (price: any) {
    const parsedPrice = parseFloat(price);
    return isNaN(parsedPrice) ? null : parsedPrice;
  }

}
