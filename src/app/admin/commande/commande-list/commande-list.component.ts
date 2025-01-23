import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { AppSettings, Settings } from '../../app.settings';
//import { UsersService } from './users.service';
//import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ConnectableObservable, Observable, catchError, first, lastValueFrom, map } from 'rxjs';
import { json } from 'stream/consumers';
import { User } from 'src/app/models/user.models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserAddForm, UserEditForm } from 'src/app/models/userForm.model';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { Settings } from 'http2';
import { AppSettings } from 'src/app/app.settings';
import { UserDialogComponent } from '../../users/user-dialog/user-dialog.component';
import { UsersService } from '../../users/users.service';
import { CommandeService } from 'src/app/services/commande.service';
import { Commande } from 'src/app/models/commande.models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-commande-list',
  templateUrl: './commande-list.component.html',
  styleUrls: ['./commande-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ UsersService ]
})
export class CommandeListComponent implements OnInit {
    public users: User[];
    public commandes: Commande[];
    public sortedCommandes: Commande[]=null;
    public searchText: string = '';
    public page:any;
    public settings: any;
    domHandlerService = inject(DomHandlerService);
    isAboveSmSize$: Observable<boolean>;
    isAboveMdSize$: Observable<boolean>;
    ascFirstname: boolean = true;
    ascLastname: boolean = true;
    ascType: boolean = true;
    ascMember: boolean = true;

    constructor(
      public appSettings: AppSettings,
      public dialog: MatDialog, private commonService: CommonMessageService,
      private authService:AuthenticationService,
      public usersService: UsersService,
      private breakpointObserver:BreakpointObserver,
      private ngxSpinnerService: NgxSpinnerService,
      private auth: AuthenticationService,
      private commandeService: CommandeService
    ){
        this.settings = this.appSettings.settings;
    }

    ngOnInit() {
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

        // fetch all the users from the server
        this.getCommandes();
    }

    public async getCommandes() {
     /// this.ngxSpinnerService.show(); // Assurez-vous d'afficher le spinner avant la requête
    
      await this.commandeService.getAllCommande().pipe(
        map((commande: any) => {           
          return commande;
        }),
        catchError((error: any) => {
          console.error("Erreur lors de la récupération des commandes : ", error);
          this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
          return []; // Retourne une liste vide en cas d'erreur pour éviter les plantages
        }),
        finalize(() => {
          this.ngxSpinnerService.hide(); // Masquez le spinner une fois la requête terminée (succès ou erreur)
        })
      ).subscribe(
        (data: any) => {
          this.commandes = data;
          console.log("Commandes récupérées :", JSON.stringify(this.commandes));
          this.ngxSpinnerService.hide();
        }
      );
    }
    


   
    public addUser(userFormData:UserAddForm){
      let userInfo:any = {
        role:[userFormData.type.name],
        username    : (userFormData.contacts.email || userFormData.contacts.phoneNumber),
        firstname   : userFormData.firstname,
        lastname    : userFormData.lastname,
        email       : userFormData.contacts.email,
        phoneNumber : userFormData.contacts.phoneNumber,
        adresse     : userFormData.contacts.address,
        password    : userFormData.auth.password2,
        typeofUser  : (userFormData.contacts.email)? 'email'  : 'tel'
      }
      console.log(userInfo);
      return this.authService.signup(userInfo).subscribe((user:any) => {
        this.getCommandes();
      });
    }

    public async updateUser(id:string,userFormData:UserEditForm){
      let userInfo:any = {
        type        : (userFormData.type.name),
        role:[userFormData.type.name],
        // username    : (userFormData.username),
        firstname   : (userFormData.firstname),
        lastname    : (userFormData.lastname),
        email       : (userFormData.contacts.email)||null,
        phoneNumber : (userFormData.contacts.phoneNumber),
        adresse     : (userFormData.contacts.address)||null,
        // password    : (userFormData.auth.password2)||null,
      };
      console.log("userInfo ::::: ",userInfo);

      return await this.authService.updateUser(id,userInfo).then(user =>{
        this.getCommandes();
      });
    }
   

    public async deleteCommande(id : any){
      try {
          let res : any = await this.commandeService.delete(id).toPromise()

          this.commonService.successToast('Commande supprimer avec succès');

          this.getCommandes()
          return res
      } catch (error : any) {
          console.log(error);
          return "KO"
      }
    }



  

    public remove(commande: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Suppression",
        message: "Vous etes sur de supprimer la commande: "+commande.codeCommande+" ?"
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        console.log("verify ::::")
        this.deleteCommande(commande.id)
      
      }
    });
  }
    public onPageChanged(event){
        this.page = event;
        this.getCommandes();
        this.domHandlerService.winScroll(0, 0);
    }

 



    // the sorting method
    sortCommandes(keyWord: string) {

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

      this.sortedCommandes = [...this.commandes].sort((a, b) => {
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

// function to get the sortable value based on 'keyWord'
getSortValue(commande: Commande, keyWord: string): any {
  switch (keyWord) {
    case "codeCommande":
      return commande.codeCommande?.trim().toLowerCase() || '';
    case "montant":
      return commande.montant?.toString().trim().toLowerCase() || '';
    case "quantite":
      return commande.quantite?.toString().toLowerCase() || '';
      case "clientUsername":
        return commande.clientUsername.toLowerCase() || '';
    case "dateCommande": 
      return new Date(commande.dateCommande).getTime() || 0;
    default:
      return '';
  }
}

 search() {
    if (this.searchText.trim()) {
      this.commandes = this.commandes.filter(order =>
        order.codeCommande.toLowerCase().includes(this.searchText.toLowerCase()) 
       /* ||
       order.prixUnitaire.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.quantite.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
       order.dateCommande.toString().toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.montant.toString().toLowerCase().includes(this.searchText.toLowerCase())*/
      );
    } else {
      this.getCommandes();    }
  }


}
