import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-product-state',
  templateUrl: './product-state.component.html',
  styleUrls: ['./product-state.component.scss']
})
export class ProductStateComponent implements OnInit {
  public products: Array<any> = [];
  public viewCol: number = 25;
  public page: any;
  public count = 12;
  constructor(public appService:AppService, public productService:ProductService, public dialog: MatDialog, public produitService: ProductService,
    public domHandlerService: DomHandlerService) { }

  ngOnInit(): void {
    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };
    this.getAllProducts();
  }

  public async getAllProducts(){
    let res : Array<any> = await this.produitService.statsSellerActif()
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


  public remove(product:any){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous etes sur de supprimer produit?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if(dialogResult){
        this.produitService.supprimer(product.id).subscribe(
          () => {
            // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
            const index: number = this.products.findIndex((us: any) => us.id === product.id);
            if (index !== -1) {
              this.products.splice(index, 1);
            }
            console.log("Produit successfully deleted.");
          },
          (error) => {
            console.error("Error deleting produit:", error);
            // Traiter les erreurs éventuelles lors de la suppression de la catégorie
          }
        );
      }
    });
  }

  
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
