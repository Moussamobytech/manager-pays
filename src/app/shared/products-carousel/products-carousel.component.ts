import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SwiperConfigInterface } from '../../theme/components/swiper/swiper.module';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { AppService } from '../../app.service';
import { Product } from "../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products-carousel',
  templateUrl: './products-carousel.component.html',
  styleUrls: ['./products-carousel.component.scss']
})
export class ProductsCarouselComponent implements OnInit {

  @Input('idCat') idCat: string;
  @Input('products') products: Array<Product> = [];
  public config: SwiperConfigInterface = {};
  public settings: Settings;
  imageData: string | ArrayBuffer | null = null;
  constructor(public appSettings: AppSettings, public appService: AppService, public dialog: MatDialog,
    private router: Router,  public produitService : ProductService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.getProductByCategorie(this.idCat);
   }

  public getProductByCategorie(type: string){
    console.log("cateeeeeee ",type);

    if(type == "best"){

      this.getProduitByBest()
    }
    if(type == "promotion"){
      this.getProduitByPromotion()
    }
    if(type == "topRate"){
      this.getTopRate()
    }
    if(type == "newArrivals"){
      this.getTopRate()
    }
  }

  ngAfterViewInit() {
    this.config = {
      observer: true,
      slidesPerView: 1,
      spaceBetween: 16,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 1
        },
        740: {
          slidesPerView: 2
        },
        960: {
          slidesPerView: 3
        },
        1280: {
          slidesPerView: 4
        },
        1500: {
          slidesPerView: 5
        }
      }
    }
  }

  public openProductDialog(product) {
    let dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if (product) {

        this.router.navigate(['/products', product.id, product.nom]);
      }
    });
  }

  public async getProduitByPromotion() {
    this.products = await this.produitService.getProductByTop()
    console.log("res promotion :::::::: ",this.products)
  }
  public async getProduitByBest() {
    this.products = await this.produitService.getProductByTop()
    console.log("res best :::::::: ",this.products)
  }

  public async getNewArrivals() {
    this.products = await this.produitService.getProductByNewArrival("yes")
    console.log("res newArrivals :::::::: ",this.products)

  }
  public async getTopRate() {
    this.products = await this.produitService.getProductByTop()
    console.log("res topRate :::::::: ",this.products)
  }




}
