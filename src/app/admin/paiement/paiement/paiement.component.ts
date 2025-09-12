import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { PaiementService } from 'src/app/services/paiement.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommandeService } from 'src/app/services/commande.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrl: './paiement.component.scss'   // ❌
})

export class PaiementComponent implements OnInit {
filteredPaiements: any;
remove(arg0: any) {
throw new Error('Method not implemented.');
}

  domHandlerService = inject(DomHandlerService);
  isAboveSmSize$: Observable<boolean>;
  isAboveMdSize$: Observable<boolean>;

status: any;
setStatusT(arg0: any,arg1: any,_t86: any) {
throw new Error('Method not implemented.');
}
Status(arg0: any) {
throw new Error('Method not implemented.');
}
page: string|number;
  constructor(
    private breakpointObserver:BreakpointObserver,
   // private ngxSpinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private commandeService: CommandeService,
    private paiementService: PaiementService) { }


  paiements:any;
  sortPaiement:any;
  public searchText: string = '';
  commandeCodes: { [id: string]: string } = {};



  ngOnInit(): void {
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
    // Initialization logic can go here
    this.getAllPaiements();
  }


  getAllPaiements() {   
    this.paiementService.getAllPaiements().subscribe(
      (response) => {
       // console.log('Paiements retrieved successfully:', response);
        this.paiements = response.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
                this.paiements.forEach(p => {
          this.commandeService.getById(p.commandeId).subscribe(c => {
            p.idC = c.id;
            this.commandeCodes[p.commandeId] = c.codeCommande;
          });
        });
      },
      (error) => {
        console.error('Error retrieving paiements:', error);
      }
    );
  }

 /*getCommandeById(id: any) {  
    this.commandeService.getById(id).subscribe(
      (response) => {
        console.log('Commande retrieved successfully:', response);
        return response.codeCommande;
      },
      (error) => {
        console.error('Error retrieving commande:', error);
        return null;
      }
    );
  }*/

  search() {
    if (this.searchText.trim()) {
      this.paiements = this.paiements.filter((paiement: any) =>
        paiement.client.toLowerCase().includes(this.searchText.toLowerCase()) ||
        paiement.montant.toString().includes(this.searchText) ||
        paiement.date.toLowerCase().includes(this.searchText.toLowerCase()) ||
        paiement.status.toLowerCase().includes(this.searchText.toLowerCase())
        // paiement.amount.toLowerCase().includes(searchText.toLowerCase()) ||
      );
    } else {
      this.getAllPaiements(); // Reset to original list if search text is empty
    }
  }

  getSortValue(paiement: any, sortBy: string): string | number {
    switch (sortBy) {
      case 'client':
        return paiement.client.toLowerCase();
      case 'montant':
        return paiement.amount;
      case 'date':
        return new Date(paiement.date).getTime(); // Convert date to timestamp for sorting
      case 'status':
        return paiement.status.toLowerCase();
      
        case 'currency':
        return paiement.currency.toLowerCase();
      case 'payeur':
        return paiement.payeur.toLowerCase();
      default:
        return '';
    }
  }

  sortPaiements(keyWord: string) {
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if(this[ascKey] == undefined) {
      this[ascKey] = true;
    }
    this.sortPaiement = [...this.paiements].sort((a: any, b: any) => {
      const aValue = this.getSortValue(a, keyWord);
      const bValue = this.getSortValue(b, keyWord);
      
      if (aValue < bValue) {
        return this[ascKey] ? -1 : 1;
      } else if (aValue > bValue) {
        return this[ascKey] ? 1 : -1;
      } else {
        return 0;
      }
    }
    );
    this[ascKey] = !this[ascKey]; // Toggle the sort order for next click
  }


  public onPageChanged(event){
    this.page = event;
    this.getAllPaiements();
    this.domHandlerService.winScroll(0, 0);
}

deletePaiement(paiement: any) {  

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    maxWidth: "400px",
    data: {
      title: "Suppression",
      message: "Vous etes sur de supprimer ce paiement: "+paiement.order_id+" ?"
    }
  });

  dialogRef.afterClosed().subscribe(dialogResult => {
    if (dialogResult) {
     // console.log("verify ::::")
      this.delete(paiement.id);
    
    }
  });



  
}

delete(paiementId){
  this.paiementService.deletePaiement(paiementId).subscribe(
    () => {
      this.paiements = this.paiements.filter((paiement: any) => paiement.id !== paiementId);
      // Optionally, you can show a success message or perform other actions
    },
    (error) => {
      console.error('Error deleting paiement:', error);
      // Optionally, you can show an error message
    }
  );
}

}
