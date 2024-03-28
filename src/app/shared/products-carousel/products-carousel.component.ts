import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SwiperConfigInterface } from '../../theme/components/swiper/swiper.module';
import { MatDialog } from '@angular/material/dialog';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { AppService } from '../../app.service';
import { Product } from "../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';

@Component({
  selector: 'app-products-carousel',
  templateUrl: './products-carousel.component.html',
  styleUrls: ['./products-carousel.component.scss']
})
export class ProductsCarouselComponent implements OnInit {

  @Input('idCat') idCat: string;
  @Input('images') images: string;
  @Input('products') products: Array<Product> = [];
  public config: SwiperConfigInterface = {};
  public settings: Settings;
  constructor(public appSettings: AppSettings, public appService: AppService, public dialog: MatDialog, private router: Router) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.getProductByCategorie(this.idCat);
    this.getImage("548939ee-c5ff-4460-af04-9e5ed5dbdfe1");
   }

  public getProductByCategorie(categorie: string){
    console.log("cateeeeeee ",categorie);
    this.appService.getProductByCategorie(categorie).subscribe(
      data => {
        this.products= data
        console.log("cateeeeeee ",data);


      }
    )
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

  public getImage(id: string) {
    this.appService.getImage(id).subscribe(data=>{
      this.images = data;
      console.log('this.images');
      console.log(this.images)
    });
  }
}
