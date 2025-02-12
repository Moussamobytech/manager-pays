import { Component, OnInit, inject, TemplateRef, ViewChild } from '@angular/core';
import { Order } from 'src/app/models/order.models';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild('popupDetails') popupDetails: TemplateRef<any>;

  /*public orders = [
    { number: '#3258', date: 'March 29, 2018', status: 'Completed', total: '$140.00 for 2 items', invoice: true },
    { number: '#3145', date: 'February 14, 2018', status: 'On hold', total: '$255.99 for 1 item', invoice: false },
    { number: '#2972', date: 'January 7, 2018', status: 'Processing', total: '$255.99 for 1 item', invoice: true },
    { number: '#2971', date: 'January 5, 2018', status: 'Completed', total: '$73.00 for 1 item', invoice: true },
    { number: '#1981', date: 'December 24, 2017', status: 'Pending Payment', total: '$285.00 for 2 items', invoice: false },
    { number: '#1781', date: 'September 3, 2017', status: 'Refunded', total: '$49.00 for 2 items', invoice: false }
  ]*/
  user: User;
  idUser: string;
  username: string;
  orders: Order[];
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  selectedOrder: Order | null = null;


  constructor(private router: Router, public dialog: MatDialog, private authService: AuthenticationService, private commandeService: CommandeService) { }

  ngOnInit() {
    this.getUser();
    this.getAllCommande();
  }

  getAllCommande() {
    this.commandeService.getAllCommandeByUsername(this.username).subscribe(datas => {
      this.orders = datas;
      console.log("PANIER : ", JSON.stringify(datas));

    }, error => {
      //this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      console.error('Error during recharge:', error);
    });

  }
  getUser() {
    this.user = this.authService.currentUser();
    if (this.user != null) {
      this.idUser = this.user.id;
      this.username = this.user.username
      console.log("1USERS :::::::::::::::: ", this.username);

    }
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
    if (this.sortKey === key) {
      // Inversez la direction si on clique sur la même colonne
      this.sortDirection = !this.sortDirection;
    } else {
      // Définir une nouvelle colonne de tri et initialiser la direction
      this.sortKey = key;
      this.sortDirection = false; // Commencer par un tri ascendant
    }
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

  openOrderDetails(order: Order): void {
    this.selectedOrder = order; // Stocker l'objet sélectionné
    const dialogRef = this.dialog.open(this.popupDetails, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.selectedOrder = null; // Réinitialiser après fermeture
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
        case "VALIDE":
          res = "Validée"
          break;

      default:
        res = "N/A"
        break;
    }
    return res
  }

}
