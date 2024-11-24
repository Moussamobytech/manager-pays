import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seller-info',
  templateUrl: './seller-info.component.html',
  styleUrls: ['./seller-info.component.scss']
})
export class SellerInfoComponent implements OnInit {
  public products: Array<any> = [];
  public viewCol: number = 25;
  public page: any;
  public count = 12;
  constructor(public appService:AppService, public productService:ProductService, public dialog: MatDialog, 
    public produitService: ProductService, private activatedRoute: ActivatedRoute,
    public domHandlerService: DomHandlerService) { }

  ngOnInit(): void {
    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };
    this.activatedRoute.params.subscribe(params => {
      if(params['id']){
        this.sellerInfo(params['id']);
      }
    });
    
  }

  public async sellerInfo(id){
    let res : Array<any> = await this.produitService.infoSellerContact(id)
    console.log("res product :::::::: ",res)
    this.products = res

  }

  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  // public edit(id){
  //   this.router.navigate(["/account/add-product/"+id])
  // }  

}
