import { Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
// import { Product, Category } from "../../../app.models";
import { Settings, AppSettings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { Product } from 'src/app/models/product.models';
import { Category } from 'src/app/models/category.models';
import { AppService } from 'src/app/app.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { Order } from 'src/app/models/order.models';

@Component({
  selector: 'app-brand',
  templateUrl: './orders-manage.components.html',
  styleUrls: ['./orders-manage.components.scss']
})
export class OrdersManageComponents implements OnInit {
  @ViewChild('sidenav', { static: true }) sidenav: any;
  @ViewChild('popupDetailsC') popupDetailsC: TemplateRef<any>;
  
  public sidenavOpen:boolean = true;
  private sub: any;
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public counts = [12, 24, 36];
  public count:any;
  public sortings = ['Sort by Default', 'Best match', 'Lowest first', 'Highest first'];
  public sort:any;

  public page:any;
  public settings: Settings;
  constructor(public appSettings:AppSettings,
              private activatedRoute: ActivatedRoute,
              public appService:AppService,
              public dialog: MatDialog,
              private router: Router,
              private commandeService: CommandeService,
              private authService: AuthenticationService, 
              public domHandlerService: DomHandlerService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.getAllStatus()
    this.count = this.counts[0];
    this.sort = this.sortings[0];
    this.sub = this.activatedRoute.params.subscribe(params => {
     // console.log(params['name']);
    });
    if(this.domHandlerService.window?.innerWidth < 960){
      this.sidenavOpen = false;
    };
    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };

    this.getUser()
    this.getAllCommande()
    
  }


  user:any
  idUser:any
  username:any
  orders:any
  status:any
    selectedOrder: Order | null = null;
  getUser() {
    this.user = this.authService.currentUser();
    if (this.user != null) {
      this.idUser = this.user.id;
      this.username = this.user.username
    }
  }
  getAllCommande() {
    this.commandeService.getAllCommandeByFournisseur(this.username).subscribe(datas => {
      this.orders = datas;
    }, error => {
      //this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      console.error('Error during recharge:', error);
    });

  }

  getAllStatus(){
    this.commandeService.getAllStatusCommander().subscribe(datas => {
      this.status = datas;
    }, error => {
      console.error('Error during recharge:', error);
    });
  }

  setStatusT(idPanier: string, status: string, order: any) {
    this.commandeService.setStatus(idPanier, status).subscribe(
      () => {
        // Mettre à jour le statut localement
        const updatedStatus = this.status.find(st => st.id === status);
        if (updatedStatus) {
          order.statutCommande = updatedStatus;
        }
      },
      error => {
        console.error('Error during recharge:', error);
      }
    );
  }
  

  public onPageChanged(event) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

   // Propriétés pour suivre l'état du tri
   sortKey: string = '';
   sortDirection: boolean = false; // false = ascendant, true = descendant
 
   // Méthode pour gérer le tri
   sortBy(key: string): void {
    console.log("::::::::::::: SORT 1 ",key);
    
     if (this.sortKey === key) {
       // Inversez la direction si on clique sur la même colonne
       this.sortDirection = !this.sortDirection;
     } else {
       // Définir une nouvelle colonne de tri et initialiser la direction
       this.sortKey = key;
       this.sortDirection = false; // Commencer par un tri ascendant
     }
   }

   openOrderDetails(order: Order): void {
    this.selectedOrder = order; // Stocker l'objet sélectionné
    const dialogRef = this.dialog.open(this.popupDetailsC, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.selectedOrder = null; // Réinitialiser après fermeture
    });
  }
 
   // Méthode pour renvoyer les données triées
   sortedOrders() {
     return this.orders.sort((a, b) => {
       let valA = a[this.sortKey];
       let valB = b[this.sortKey];
 
       if (typeof valA === 'string') {
         valA = valA.toLowerCase();
         valB = valB.toLowerCase();
       }
 
       if (this.sortDirection) {
         return valA > valB ? -1 : valA < valB ? 1 : 0;
       } else {
         return valA < valB ? -1 : valA > valB ? 1 : 0;
       }
     });
   }
   phoneCall(phoneNumber: string): void {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      console.error('Numéro de téléphone invalide.');
      return;
    }
  
    const telUrl = `tel:+${phoneNumber}`;
    window.open(telUrl, '_self');
    
  }
  

  onNoClick(): void {
    this.dialog.closeAll();
  }

  public Status(key) {
    let res = ""
    switch (key) {
      case "DELIVERED":
        res = "Livrer"
        break;

      case "CANCEL":
        res = "Annuler"
        break;

      case "PENDING":
        res = "En attente"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

 /* public changeCount(count){
    this.count = count;
    this.getAllProducts();
  }

  public changeSorting(sort){
    this.sort = sort;
  }

  public changeViewType(viewType, viewCol){
    this.viewType = viewType;
    this.viewCol = viewCol;
  }

  public openProductDialog(product){
    let dialogRef = this.dialog.open(ProductDialogComponent, {
        data: product,
        panelClass: 'product-dialog',
        direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(product => {
      if(product){
        this.router.navigate(['/products', product.id, product.nom]);
      }
    });
  }



  public onChangeCategory(event){
    if(event.target){
      this.router.navigate(['/products', event.target.innerText.toLowerCase()]);
    }
  }
  */

}
