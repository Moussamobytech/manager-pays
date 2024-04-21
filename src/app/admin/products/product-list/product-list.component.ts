import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/models/product.models';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  public products: Array<Product> = [];
  public viewCol: number = 25;
  public page: any;
  public count = 12;
  constructor(public appService:AppService, public dialog: MatDialog, public produitService: ProductService,
    public domHandlerService: DomHandlerService) { }

  ngOnInit(): void {
    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };
    this.getCategories();
    this.getAllProducts(); 
  }

  public async getAllProducts(){
    let res : Array<Product> = await this.produitService.products()
    console.log("res product :::::::: ",res)
    this.products = res
    // this.appService.getProducts("featured").subscribe(data=>{
    //   this.products = data; 
    //   //for show more product  
    //   for (var index = 0; index < 3; index++) {
    //     this.products = this.products.concat(this.products);        
    //   }
    // });
  }

  public onPageChanged(event){
    this.page = event; 
    this.domHandlerService.winScroll(0, 0); 
  }

  @HostListener('window:resize')
  public onWindowResize():void { 
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }
 

  public remove(product:any){  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want delete this product?"
      }
    }); 
    dialogRef.afterClosed().subscribe(dialogResult => { 
      if(dialogResult){
        const index: number = this.products.indexOf(product);
        if (index !== -1) {
          this.products.splice(index, 1);  
        } 
      } 
    }); 
  }

  

  public getCategories(){  
    if(this.appService.Data.categories.length == 0) { 
      this.appService.getCategories().subscribe(data => { 
        this.appService.Data.categories = data;
      });
    } 
  }

  
  // public edit(id){
  //   this.router.navigate(["/account/add-product/"+id])
  // }  

  public etat(key){
    let res = ""
    switch (key) {
      case "ACTIF":
        res = "Actif"
        break;
      
      case "INACTIF":
        res = "Inactif"
        break;
    
      case "PENDING":
        res = "En attente de validation"
        break;
    
      default:
        res = "N/A"
        break;
    }
    return res
  }
}
