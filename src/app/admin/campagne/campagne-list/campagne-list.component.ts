import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Campagne, Product } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { CategoryDialogComponent } from '../../products/categories/category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CampagneDialogComponent } from '../campagne-dialog/campagne-dialog.component';
import { FormBuilder } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CampagneService } from 'src/app/services/campagne.service';

@Component({
  selector: 'app-campagne-list',
  templateUrl: './campagne-list.component.html',
  styleUrl: './campagne-list.component.scss'
})

export class CampagneListComponent implements OnInit {
  public viewCol: number = 25;
  public campagne : Array<Campagne> = [];
  public page: any;
  public count = 5;
  public settings:Settings;
  public id : string;
  public products: Array<Product> = [];

  form = this.fb.group({
    etat : [null]
  })
  constructor(public appService:AppService, public campagneService : CampagneService, public fb : FormBuilder,
    public domHandlerService: DomHandlerService, public dialog: MatDialog, public appSettings:AppSettings) {
    this.settings = this.appSettings.settings;

   }

  ngOnInit(): void {



    if(this.domHandlerService.window?.innerWidth < 1280){
      this.viewCol = 33.3;
    };
    this.getCampagne();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  // public getCampagne(){

  //   try {
  //     let res = this.campagneService.getCampagne();
  //     this.campagne = res;
  //     console.log("Campagne :"+ this.campagne);
  //   } catch (error) {
  //     console.log('error Campagne Id ', error);
  //   }

  // }
  public getCampagne(){
    this.campagneService.getCampagne().subscribe(data=>{
      this.campagne = data;
      console.log("campagne :", this.campagne)
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }
  public getAllProducts(){
    this.appService.getAllProducts().subscribe(data=>{
      this.products = data;
      console.log("Produit :", this.products)
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }
  public openCampagneDialog(data: any) {
    const dialogRef = this.dialog.open(CampagneDialogComponent, {
      data: {
        campagne: data,
         products : this.products,
        campagnes: this.campagne
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(campagne => {
      if (campagne) {
        const index: number = this.campagne.findIndex(x => x.id === campagne.id);
        if (index !== -1) {
          // Si la campagne existe déjà, mettez à jour ses données
          this.campagne[index] = campagne;
        } else {
          // Si la campagne n'existe pas, ajoutez-la à la liste
          const lastCampagne = this.campagne[this.campagne.length - 1];
          campagne.id = lastCampagne.id + 1;
          this.campagne.push(campagne);
        }
      }
    });
  }



  public remove(campagne: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Êtes-vous sûr de vouloir supprimer cette campagne?"
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        // Si l'utilisateur confirme la suppression dans la boîte de dialogue
        this.appService.supprimerCampagne(campagne.id).subscribe(
          () => {
            // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
            const index: number = this.campagne.findIndex((cat: any) => cat.id === campagne.id);
            if (index !== -1) {
              this.campagne.splice(index, 1);
            }
            console.log("Category successfully deleted.");
          },
          (error) => {
            console.error("Error deleting category:", error);
            // Traiter les erreurs éventuelles lors de la suppression de la catégorie
          }
        );
      }
    });
 }

  // public setStatusCampagne(id: string, etat: boolean): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     maxWidth: "400px",
  //     data: {
  //       title: "Confirm Action",
  //       message: `Are you sure you want to set the status of this etat to ${etat}?`
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {
  //       // Si l'utilisateur confirme dans la boîte de dialogue
  //       this.appService.setStatusCampagne(id, etat).subscribe(
  //         () => {
  //           console.log(`Status of campagne successfully set to ${etat}.`);
  //           // Mettre à jour l'état de la catégorie dans votre application si nécessaire
  //         },
  //         error => {
  //           console.error("Error setting campagne etat:", error);
  //           // Traiter les erreurs éventuelles lors de la modification du statut de la catégorie
  //         }
  //       );
  //     }
  //   });


  // public setStatusCampagne(ID: string): void {
  //   let status = this.form.value;
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     maxWidth: "400px",
  //     data: {
  //       title: "Confirm Action",
  //       message: `Are you sure you want to set the status of this campagne to ${ID}?`
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {
  //       // Si l'utilisateur confirme dans la boîte de dialogue

  //       this.appService.setStatusCampagne(ID, status.etat).subscribe(
  //         () => {
  //           console.log(`Status of campagne successfully set to ${ID}.`);
  //           // Mettre à jour l'état de la campagne dans votre application si nécessaire
  //         },
  //         error => {
  //           console.error("Error setting campagne etat:", error);
  //           // Traiter les erreurs éventuelles lors de la modification du statut de la campagne
  //         }
  //       );
  //     }
  //   });
  // }

  setStatusCampagne(id: string, event: MatSlideToggleChange): void {
    // Trouver la campagne correspondante dans la liste
    const campagne = this.campagne.find(c => c.id === id);
    if (campagne) {
      // Mettre à jour l'état de la campagne
      campagne.etat = event.checked;
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.appService.setStatusCampagne(id, event.checked).subscribe(
        () => {
          console.log(`Statut de la campagne ${id} modifié avec succès à ${event.checked}.`);
          // Mettre à jour l'état de la campagne dans votre application si nécessaire
        },
        error => {
          console.error("Erreur lors du réglage du statut de la campagne:", error);
          // Traiter les erreurs éventuelles lors de la modification du statut de la campagne
        }
      );
    }
  }


}
