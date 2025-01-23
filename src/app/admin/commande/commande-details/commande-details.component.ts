import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { UsersService } from '../../users/users.service';
import { User } from 'src/app/models/user.models';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from 'src/app/services/commande.service';
import { Order } from 'src/app/models/order.models';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { map, Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommandeDialogComponent } from '../commande-dialog/commande-dialog.component';
import { AppSettings, Settings } from 'src/app/app.settings';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CommandeAddNoteComponent } from '../commande-add-note/commande-add-note.component';

@Component({
  selector: 'app-commande-details',
  templateUrl: './commande-details.component.html',
  styleUrl: './commande-details.component.scss'
})
export class CommandeDetailsComponent implements OnInit {
  codeCommande: string;


  constructor(
    public appSettings: AppSettings,
    private commandeService: CommandeService,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver:BreakpointObserver,
    public dialog: MatDialog,
  ) {
    this.settings = this.appSettings.settings;
  }
  public page:any;
  public sortedPanier: Order[] ;
  currentUser: User
  public sub: any;
  public paniers: Order[];
    public settings:Settings;
  
  searchText:string = '';
   domHandlerService = inject(DomHandlerService);
      isAboveSmSize$: Observable<boolean>;
      isAboveMdSize$: Observable<boolean>;
      ascFirstname: boolean = true;
      ascLastname: boolean = true;
      ascType: boolean = true;
      ascMember: boolean = true;

      idUrls:string;

  ngOnInit(): void {

    this.sub = this.activatedRoute.params.subscribe(params => {
   
      this.idUrls = params['id'];
      this.codeCommande = params['code'];
      this.getPanierById(params['id']);
  });
  
     // request a size event in order to get availble screen size | Check Small size
            this.isAboveSmSize$ = this.breakpointObserver.observe([Breakpoints.Small,Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
            .pipe(
              map(result => result.matches)
            );
            // request a size event in order to get availble screen size | Check Medium size
            this.isAboveMdSize$ = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
            .pipe(
              map(result => result.matches)
            );
   
  }

  public async getPanierById(id: string) {
    await this.commandeService.getAllByIdCommande(id).subscribe(data => {
      this.paniers = data;
    });
  }


  sortPaniers(keyWord: string) {

    /* For you to understand this, just asume that the const ascKey and the this[ascKey] are different:
       - ascKey exists just to help with accessing the correct keyWord to sort on (like this["ascFirstname"])
       - this[ascKey] is the actual dynamic sort direction, and it is object property which stores boolean state for each entry of the keyWord
    */
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true; // Initialize to ascending on the first sort
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedPanier = [...this.paniers].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        // This sorting way allows us to account every french characters even accentuated ones
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    // Toggle the direction for the next sort dynamically
    this[ascKey] = !isAscending;
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

  // function to get the sortable value based on 'keyWord'
  getSortValue(panier: Order, keyWord: string): any {
    switch (keyWord) {
      case "produitNom":
        return panier.produitNom?.trim().toLowerCase() || '';
        case "codeCommande":
          return panier.codeCommande?.trim().toLowerCase() || '';
      case "quantite":
        return panier.quantite?.toString().trim().toLowerCase() || '';
      case "prixUnitaire":
        return panier.prixUnitaire?.toString().trim().toLowerCase() || '';
      case "montant":
        return panier.montant?.toString().trim().toLowerCase() || '';
      case "fournisseur":
        return panier.fournisseurUsername?.trim().toLowerCase() || '';
      case "dateCommande":
        return panier.dateCommande?.toString().trim().toLowerCase() || '';
        case "fournisseurUsername":
          return panier.fournisseurUsername?.toString().trim().toLowerCase() || '';
          case "statutCommande":
            return panier.statutCommande.name?.toString().trim().toLowerCase() || '';
    
      default:
        return '';
    }
  }

  search() {
    if (this.searchText.trim()) {
      this.paniers = this.paniers.filter(order =>
        order.produitNom.toLowerCase().includes(this.searchText.toLowerCase()) ||
        //order.prixUnitaire.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
        //order.quantite.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.fournisseurUsername.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.statutCommande.name.toLowerCase().includes(this.searchText.toLowerCase()) 
       // order.dateCommande.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
       // order.montant.toString().toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.getPanierById(this.idUrls);    }
  }

  public openProductDetails(data: any) {
    const dialogRef = this.dialog.open(CommandeDialogComponent, {
      data: {
        product: data,
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: this.settings.rtl ? 'rtl' : 'ltr',
      width: '400px', // Spécifiez la largeur
      height: '400px', // Spécifiez la hauteur
      maxWidth: '90vw', // Optionnel : limite la largeur à un pourcentage de la fenêtre
      maxHeight: '90vh' // Optionnel : limite la hauteur à un pourcentage de la fenêtre
    });
  
    dialogRef.afterClosed().subscribe(product => {
      this.getPanierById(this.idUrls);
    });
  }

   public remove(order: any) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: {
          title: "Suppression",
          message: "Vous etes sur de supprimer ce produit ?"
        }
      });
  
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
         // this.deleteCommande(commande.id)
        
        }
      });
    }

    public addNote(order: any) {
      const dialogRef = this.dialog.open(CommandeAddNoteComponent, {
        maxWidth: "500px",
        width:"500px",
        data: {
          title: "Ajouter un commentaire",
          order:order
         // message: "Le commentaire sera ajouté"
        }
      });
  
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
         // this.deleteCommande(commande.id)
        
        }
      });
    }
  
}
