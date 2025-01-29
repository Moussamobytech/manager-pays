import { orders, products, refunds } from '../dashboard.data';
import { ElementRef, ViewChild, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ConnectableObservable, Observable, catchError, first, lastValueFrom, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { AppSettings } from 'src/app/app.settings';
import { UsersService } from '../../users/users.service';
import { CommandeService } from 'src/app/services/commande.service';
import { finalize } from 'rxjs/operators';
import { of } from 'rxjs'; // Ajoutez cette importation



@Component({
  selector: 'app-info-cards',
  templateUrl: './info-cards.component.html',
  styleUrls: ['./info-cards.component.scss']
})
export class InfoCardsComponent implements OnInit { 
  public orders: any[];
  public ordersMensuel: any[];
  public products: any[];
  public customers: any[];
  public  refunds: any[];
  public colorScheme: any = {
    domain: ['rgba(255,255,255,0.8)']
  }; 
  public autoScale = true;
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0; 
  totalOrders: any = 0;
  totalMontantOrders: any = 0;
  totalOrdersMensuelles: any;
  totalMontantMensuelles: any;
  montantVenteTotal: any;
  venteTotal: any;
  paniers: any;
  venteTotalMensuel: number;
  montantTotalMensuel: any;
  productsMensuel: { name: string; series: any; }[];
  
 
  constructor(
       public appSettings: AppSettings,
       public dialog: MatDialog, private commonService: CommonMessageService,
       private ngxSpinnerService: NgxSpinnerService,
       private auth: AuthenticationService,
       private commandeService: CommandeService
     ){
     }

  ngOnInit(){
  //  this.orders = orders;
    this.products = products;
   // this.customers = customers;
    this.refunds = refunds;
   // this.orders = this.addRandomValue('orders');     
    //this.customers = this.addRandomValue('customers');
    this.getCommandes()
    this.getAllPaniers();
  }
  
  public onSelect(event) {
    console.log(event);
  }

  public addRandomValue(param) {
    switch(param) {
      case 'orders':
        for (let i = 1; i < 30; i++) { 
          this.orders[0].series.push({"name": 1980+i, "value": Math.ceil(Math.random() * 1000000)});
        } 
        return this.orders;
      case 'customers':
        for (let i = 1; i < 15; i++) { 
          this.customers[0].series.push({"name": 2000+i, "value": Math.ceil(Math.random() * 1000000)});
        } 
        return this.customers;
      default:
        return this.orders;
    }
  }

  ngOnDestroy(){
    this.orders[0].series.length = 0;
    this.customers[0].series.length = 0;
  }

  ngAfterViewChecked() {    
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
     setTimeout(() => this.orders = [...orders] ); 
      setTimeout(() => this.products = [...products] ); 
     // setTimeout(() => this.customers = [...customers] ); 
      setTimeout(() => this.refunds = [...refunds] );
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

  public async getCommandes() {
    this.ngxSpinnerService.show(); // Afficher le spinner avant la requête
  
    await this.commandeService.getAllCommande().pipe(
      map((commandes: any[]) => {
        // Obtenir le mois et l'année en cours
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Mois en cours (0 = Janvier)
        const currentYear = currentDate.getFullYear(); // Année en cours
  
        // Filtrer les commandes pour le mois en cours
        const commandesMensuelles = commandes.filter((commande: any) => {
          const dateCommande = new Date(commande.dateCommande); // Utiliser `dateCommande` au lieu de `codeCommande`
          return (
            dateCommande.getMonth() === currentMonth &&
            dateCommande.getFullYear() === currentYear
          );
        });
  
        console.log("Commandes mensuelles ::::::::::::::::::::::::::: ", commandesMensuelles);
  
        // Transformer les données pour les adapter à la structure de `orders`
        const transformedOrders = [
          {
            name: 'Commande',
            series: commandes.map(commande => ({
              name: commande.dateCommande.split('T')[0], // Utiliser la date comme nom
              value: commande.montant // Utiliser le montant comme valeur
            }))
          }
        ];
//:::::::::::::::::::::::::::::: TRANSFORME ORDER MENSUEL ::::::::::::::::: 
        const transformedOrdersMensuel = [
          {
            name: 'Commande',
            series: commandesMensuelles.map(commande => ({
              name: commande.dateCommande.split('T')[0], // Utiliser la date comme nom
              value: commande.montant // Utiliser le montant comme valeur
            }))
          }
        ];
  
        // Calculer le total des commandes mensuelles
        const totalMontantMensuelles = commandesMensuelles.reduce((total: number, commande: any) => {
          return total + commande.montant;
        }, 0);
  
        // Retourner les données transformées et les totaux mensuels
        return {
          transformedOrders,
          transformedOrdersMensuel,
          totalOrdersMensuelles: commandesMensuelles.length,
          totalMontantMensuelles
        };
      }),
      catchError((error: any) => {
        console.error("Erreur lors de la récupération des commandes : ", error);
        this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
        
        // Retourner un Observable avec des valeurs par défaut
        return of({
          transformedOrders: [],
          transformedOrdersMensuel:[],
          totalOrdersMensuelles: 0,
          totalMontantMensuelles: 0
        });
      }),
      finalize(() => {
        this.ngxSpinnerService.hide(); // Masquer le spinner une fois la requête terminée
      })
    ).subscribe(
      (result: any) => {
        const { transformedOrders,transformedOrdersMensuel, totalOrdersMensuelles, totalMontantMensuelles } = result;
  
        // Mettre à jour les variables du composant
        this.orders = transformedOrders;
        this.ordersMensuel = transformedOrdersMensuel;
        this.totalOrders = this.orders[0].series.length;
        this.totalMontantOrders = this.orders[0].series.reduce((total: number, serie: any) => {
          return total + serie.value;
        }, 0);
  
        // Mettre à jour les totaux mensuels
        this.totalOrdersMensuelles = totalOrdersMensuelles;
        this.totalMontantMensuelles = totalMontantMensuelles;
  
        console.log("Total des commandes mensuelles :", this.totalOrdersMensuelles);
        console.log("Montant total des commandes mensuelles :", this.totalMontantMensuelles);
      }
    );
  }


  public async getAllPaniers() {
    this.ngxSpinnerService.show(); // Afficher le spinner avant la requête
  
    await this.commandeService.getAllPanier().pipe(
      map((data: any) => {
        // Filtrer les données pour ne garder que les commandes avec le statut "DELIVERED"
        const deliveredData = data.filter((commande: any) => {
          return commande.statutCommande.name === 'DELIVERED';
        });
  
// Transformer les données pour les adapter à la structure de `Products`
const transformedProducts = deliveredData.map(product => ({
  name: product.dateCommande.split('T')[0], // Utiliser la date comme nom
  value: product.montant // Utiliser le montant comme valeur
}));
this.products = transformedProducts;


        return deliveredData; // Retourner les données filtrées
      }),
      catchError((error: any) => {
        console.error("Erreur lors de la récupération des commandes : ", error);
        this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
        return of([]); // Retourne une liste vide en cas d'erreur
      }),
      finalize(() => {
        this.ngxSpinnerService.hide(); // Masquer le spinner une fois la requête terminée
      })
    ).subscribe(
      (filteredData: any) => {
        this.paniers = filteredData;
  
        // Obtenir le mois et l'année en cours
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Mois en cours (0 = Janvier)
        const currentYear = currentDate.getFullYear(); // Année en cours
  
        // Filtrer les commandes pour le mois en cours
        const commandesMensuelles = filteredData.filter((commande: any) => {
          const dateCommande = new Date(commande.dateCommande);
          return (
            dateCommande.getMonth() === currentMonth &&
            dateCommande.getFullYear() === currentYear
          );
        });

        //:::::::::::::::::::::::::::::: TRANSFORME ORDER MENSUEL ::::::::::::::::: 
 const transformedProductsMensuel = commandesMensuelles.map(product => ({
  name: product.dateCommande.split('T')[0], // Utiliser la date comme nom
  value: product.montant // Utiliser le montant comme valeur
}));

console.log(transformedProductsMensuel);
 
this.productsMensuel = transformedProductsMensuel;
  
        // Calculer les totaux pour toutes les commandes (DELIVERED uniquement)
        const commandeParCode = filteredData.reduce(
          (acc: any, commande: any) => {
            acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
            acc.montantTotal += commande.montant;
            return acc;
          },
          { codes: {}, montantTotal: 0 }
        );
  
        // Calculer les totaux pour les commandes mensuelles (DELIVERED uniquement)
        const commandeParCodeMensuel = commandesMensuelles.reduce(
          (acc: any, commande: any) => {
            acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
            acc.montantTotal += commande.montant;
            return acc;
          },
          { codes: {}, montantTotal: 0 }
        );
  
        this.venteTotal = filteredData.length; // Total des commandes DELIVERED
        this.montantVenteTotal = commandeParCode.montantTotal; // Montant total des commandes DELIVERED
  
        // Valeurs mensuelles
        this.venteTotalMensuel = commandesMensuelles.length; // Nombre de commandes uniques pour le mois en cours
        this.montantTotalMensuel = commandeParCodeMensuel.montantTotal; // Montant total des commandes pour le mois en cours
  /*
        console.log("Total des commandes DELIVERED :", this.venteTotal);
        console.log("Montant total des commandes DELIVERED :", this.montantVenteTotal);
        console.log("Total des commandes mensuelles DELIVERED :", this.venteTotalMensuel);
        console.log("Montant total des commandes mensuelles DELIVERED :", this.montantTotalMensuel);
     */
      }
    );
  }

 /* public async getCommandes() {
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
            console.log("Commandes récupérées :", JSON.stringify(data));
            this.ngxSpinnerService.hide();
          }
        );
      }
      */

}