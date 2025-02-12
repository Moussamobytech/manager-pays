import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SwiperConfigInterface, SwiperDirective } from '../../../theme/components/swiper/swiper.module';
import { Data, AppService } from '../../../app.service';
import { emailValidator } from '../../../theme/utils/app-validators';
import { ProductZoomComponent } from './product-zoom/product-zoom.component';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
// import { Product } from 'src/app/app.models';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @ViewChild('zoomViewer', { static: true }) zoomViewer;
  @ViewChild(SwiperDirective, { static: true }) directiveRef: SwiperDirective;
  public config: SwiperConfigInterface={};
  public product: Product;
  public selectedImage: any;
  public path: any;
  public zoomImage: any;
  private sub: any;
  public form: UntypedFormGroup;
  public relatedProducts: Array<Product>;
  public views: any;

  constructor(public appService:AppService,
    private productService : ProductService,
              private activatedRoute: ActivatedRoute,
              public dialog: MatDialog,
              public formBuilder: UntypedFormBuilder,
              public domHandlerService: DomHandlerService) {  }

  ngOnInit() {
    this.path = window.location.href
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.getProductById(params['id']);
    });
    // this.getRelatedProducts();
  }

  ngAfterViewInit(){
    this.config = {
      observer: false,
      slidesPerView: 4,
      spaceBetween: 8,
      keyboard: true,
      navigation: true,
      pagination: false,
      loop: false,
      preloadImages: false,
      lazy: true,
      // breakpoints: {
      //   // 480: {
      //   //   slidesPerView: 4
      //   // },
      //   600: {
      //     slidesPerView:6 ,
      //   }
      // }
    }
  }

  public getProductById(id:any){

    this.appService.getProductById(id).subscribe((data:any)=>{
      let product = data;
      let nom = (product.nom).toLowerCase();
      this.product = {
        ...product,
        nom: nom.charAt(0).toUpperCase() + nom.slice(1),
        pricePromotion: this.parsePrice(product.pricePromotion),
        priceBasic: this.parsePrice(product.priceBasic),
      };
      // console.log("Produit :", this.product)
      this.selectedImage = data.image1;
      this.zoomImage = data.image1;
      setTimeout(() => {
        this.config.observer = true;
        // this.getRelatedProducts();
       // this.directiveRef.setIndex(0);
      });
    });
  }

  parsePrice (price: any) {
    const parsedPrice = parseFloat(price);
    return isNaN(parsedPrice) ? null : parsedPrice;
  }

  public async getRelatedProducts(){
    console.log("res related :::::: ",this.product);
    console.log("res related :::::: ",this.product?.categorie);
    if (this.product && this.product?.categorie) {
      // this enpoint does not work at all
      let res = await this.productService.getProductByCategorieName(this.product.categorieNom)
      console.log("res related :::::: ",res);
      this.relatedProducts = res;
    }
  }

  public selectImage(image){
    this.selectedImage = image;
    this.zoomImage = image;
  }

  public onMouseMove(e){
    if(this.domHandlerService.window?.innerWidth >= 1280){
      var image, offsetX, offsetY, x, y, zoomer;
      image = e.currentTarget;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      x = offsetX/image.offsetWidth*100;
      y = offsetY/image.offsetHeight*100;
      zoomer = this.zoomViewer.nativeElement.children[0];
      if(zoomer){
        zoomer.style.backgroundPosition = x + '% ' + y + '%';
        zoomer.style.display = "block";
        zoomer.style.height = image.height + 'px';
        zoomer.style.width = image.width + 'px';
      }
    }
  }

  public onMouseLeave(event){
    this.zoomViewer.nativeElement.children[0].style.display = "none";
  }

  public openZoomViewer(){
    this.dialog.open(ProductZoomComponent, {
      data: this.zoomImage,
      panelClass: 'zoom-dialog'
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public onSubmit(values:Object):void {
    if (this.form.valid) {
      //email sent
    }
  }
}
