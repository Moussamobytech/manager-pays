import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SwiperConfigInterface } from '../../theme/components/swiper/swiper.module';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from '../../app.service';
// import { Product } from "../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';
import { ProductService } from 'src/app/services/product.service';
import { ProductDialogComponent } from '../products-carousel/product-dialog/product-dialog.component';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductsCardComponent implements OnInit {

  @Input('product') product: Product = null;
  @Input('cat') cat: string = "ok";
  @Input('onePrice') onePrice: boolean = false;
  public config: SwiperConfigInterface = {};
  public settings: Settings;

  imageData: string | ArrayBuffer | null = null;
  constructor(public appSettings: AppSettings, public appService: AppService, public dialog: MatDialog,
    private router: Router,  public produitService : ProductService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    // this.incrementProductView(this.product.id);


   }



  public openProductDialog(product: any) {
    let dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if (product) {
        // this.incrementProductView(product.id)
        this.router.navigate(['/products', product.id, product.nom]);
      }
    });
  }


  setProductViewCount(id){
    this.produitService.viewProductById(id).then(data => {
    data      
    })
  }



}
