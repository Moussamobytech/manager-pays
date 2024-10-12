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
  public image: any;
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
              public produitService : ProductService,
              public formBuilder: UntypedFormBuilder,
              public domHandlerService: DomHandlerService) {  }

  ngOnInit() {
    console.log(window.location.href)
    this.path = window.location.href
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.getProductById(params['id']);
    });
    this.form = this.formBuilder.group({
      'review': [null, Validators.required],
      'name': [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': [null, Validators.compose([Validators.required, emailValidator])]
    });
    this.getRelatedProducts();
    // this.inscrementViewsProduit()
  }

  ngAfterViewInit(){
    this.config = {
      observer: false,
      slidesPerView: 4,
      spaceBetween: 10,
      keyboard: true,
      navigation: true,
      pagination: false,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3,
        }
      }
    }
  }

  public getProductById(id){

    this.appService.getProductById(id).subscribe(data=>{
      this.product = data;
      console.log("Produit :", this.product)
      this.image = data.image1;
      this.zoomImage = data.image2;
      setTimeout(() => {
        this.config.observer = true;
        // this.getRelatedProducts();
       // this.directiveRef.setIndex(0);
      });
    });
  }


  public async getRelatedProducts(){
    console.log("res related :::::: ",this.product);
    console.log("res related :::::: ",this.product?.categorie);
    if (this.product && this.product?.categorie) {
      let res = await this.productService.getProductByCategorieName(this.product.categorie)
      console.log("res related :::::: ",res);
      this.relatedProducts = res;
    }

    // this.appService.getProducts('related').subscribe(data => {
    //   this.relatedProducts = data;
    // })
  }

  public selectImage(image){
    this.image = image.medium;
    this.zoomImage = image.image2;
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


  // public inscrementViewsProduit(){
  //   this.produitService.incrementProductViews(this.product.id).then((data =>{
  //     this.views = data;
  //     console.log("Viewsssssssss ",this.views);
  //     }))
  //  }

}
