import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.models';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  currentUser : User
  public products : any = []
  public page: any;
  public count = 5;
  domHandlerService = inject(DomHandlerService);

  constructor(private productService : ProductService, private commonService : CommonMessageService, private auth : AuthenticationService,
    public dialog: MatDialog, private cm:CommonService ) { }

  ngOnInit() {

    this.currentUser = this.auth.currentUser()
   // console.log("currentUser :::::::: ",this.currentUser)

    this.loadData()
  }

  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  async loadData(){
    let res = await this.productService.productUser(this.currentUser.username)
    //console.log("res product :::::::: ",res)
    this.products = res
  }

  public add(){
    this.cm.goTo("/account-seller/products-seller/add-product");
  }

  public edit(id){
    this.cm.goTo("/account-seller/products-seller/edit-product/"+id);
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
        this.productService.supprimer(product.id).subscribe(
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

  public updateState(id, state){
    this.productService.updateState(id, state).then((data : any) =>{
      console.log(data)
    })
  }

  setStatus(id: string, event: MatSlideToggleChange) {
    this.updateState(id, event.checked ? 'ok' : 'nok');
    // to update the edited product
    this.products = this.products.map((product) => {
      if (product.id === id) {
        return { ...product, etat: (event.checked)? "ACTIF":"INACTIF" };
      }
      return product;
    });
  }

}
