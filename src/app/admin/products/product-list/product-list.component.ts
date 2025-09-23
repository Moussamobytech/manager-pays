


import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { VendeurSelectDialogComponentComponent } from './vendeur-select-dialog-component/vendeur-select-dialog-component.component';

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
  allProductsDeactivated: boolean = false;

  constructor(
    public appService: AppService,
    public productService: ProductService,
    public dialog: MatDialog,
    public produitService: ProductService,
    public domHandlerService: DomHandlerService,
    private cm: CommonService,
    private auth: AuthenticationService
  ) {}

  username: string | null = null;

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();
    this.username = currentUser ? currentUser.username : null;

    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    }
    this.getCategories();
    this.getAllProducts();
  }

  public async getAllProducts() {
    let res: Array<Product> = await this.produitService.products();
    this.products = res;
    this.allProductsDeactivated = res.every(p => p.globallyDeactivated === true);
  }

  public onPageChanged(event) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  public remove(product: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous êtes sûr de supprimer ce produit ?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.produitService.supprimer(product.id).subscribe(
          () => {
            const index: number = this.products.findIndex((us: any) => us.id === product.id);
            if (index !== -1) {
              this.products.splice(index, 1);
            }
          },
          (error) => {
            console.error("Error deleting produit:", error);
          }
        );
      }
    });
  }

  public getCategories() {
    if (this.appService.Data.categories.length === 0) {
      this.appService.getCategories().subscribe(data => {
        this.appService.Data.categories = data;
      });
    }
  }

  public etat(key) {
    let res = "";
    switch (key) {
      case "ACTIF":
        res = "Actif";
        break;
      case "INACTIF":
        res = "Inactif";
        break;
      case "PENDING":
        res = "En attente de validation";
        break;
      default:
        res = "N/A";
        break;
    }
    return res;
  }

  toggleProductState(product: Product) {
    const newState = product.etat === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    this.productService.updateState(product.id, this.username, newState === 'ACTIF' ? 'ok' : 'nok').then((data: any) => {
      product.etat = newState;
    }).catch(error => {
      console.error("Error updating product state:", error);
    });
  }

  setAllProductsState(username: string, state: 'ok' | 'nok'): void {
    this.productService.adminDeactivateAll(username, state).subscribe(data => {
      if (data) {
        this.cm.openSuccessSnackBar(data.message);
        this.getAllProducts();
        this.allProductsDeactivated = (state === 'nok');
      } else {
        this.cm.openFailureSnackBar("Une erreur est survenue lors de la mise à jour des produits.");
      }
    });
  }

  deactivateVendeurProducts(vendeurUsername: string): void {
    this.productService.deactivateByVendeur(this.username, vendeurUsername)
      .subscribe(message => {
        this.cm.openSuccessSnackBar(message.message || "Les produits du vendeur ont été désactivés avec succès.");
        this.getAllProducts();
      });
  }

  openToggleAllDialog() {
    const state = this.allProductsDeactivated ? 'ok' : 'nok';
    const actionLabel = this.allProductsDeactivated ? 'activer' : 'désactiver';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${actionLabel} tous les produits ?`,
        confirmText: 'Oui',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.setAllProductsState(this.username, state);
      }
    });
  }

  openVendeurSelectDialog(): void {
    const dialogRef = this.dialog.open(VendeurSelectDialogComponentComponent, {
      width: '400px',
      data: { username: this.username }
    });

    dialogRef.afterClosed().subscribe((selectedVendeurUsername: string) => {
      if (selectedVendeurUsername) {
        this.deactivateVendeurProducts(selectedVendeurUsername);
      }
    });
  }
}