import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Campagne } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { CategoryDialogComponent } from '../../products/categories/category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CampagneDialogComponent } from '../campagne-dialog/campagne-dialog.component';

@Component({
  selector: 'app-campagne-list',
  templateUrl: './campagne-list.component.html',
  styleUrl: './campagne-list.component.scss'
})

export class CampagneListComponent implements OnInit {
  public viewCol: number = 25;
  public campagne : Campagne[];
  public page: any;
  public count = 6;
  public settings:Settings;

  constructor(public appService:AppService, public domHandlerService: DomHandlerService, public dialog: MatDialog, public appSettings:AppSettings) {
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

  public getCampagne(){
    this.appService.getCampagne().subscribe(data =>{
      this.campagne = data;
      console.log("Camapgne :"+ this.campagne);
    })
  }

  public openCampagneDialog(data:any){
    const dialogRef = this.dialog.open(CampagneDialogComponent, {
      data: {
        campagnes: data,
        campagne: this.campagne
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(campagnes => {
      if(campagnes){
        const index: number = this.campagne.findIndex(x => x.id == campagnes.id);
        if(index !== -1){
          this.campagne[index] = campagnes;
        }
        else{
          let last_campagne = this.campagne[this.campagne.length - 1];
          campagnes.id = last_campagne.id + 1;
          this.campagne.push(campagnes);
        }
      }
    });


  }



  public remove(category: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Are you sure you want to remove this category?"
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        // Si l'utilisateur confirme la suppression dans la boîte de dialogue
        // this.appService.supprimerCategorie(category.id).subscribe(
        //   () => {
        //     // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
        //     const index: number = this.categories.findIndex((cat: any) => cat.id === category.id);
        //     if (index !== -1) {
        //       this.categories.splice(index, 1);
        //     }
        //     console.log("Category successfully deleted.");
        //   },
        //   (error) => {
        //     console.error("Error deleting category:", error);
        //     // Traiter les erreurs éventuelles lors de la suppression de la catégorie
        //   }
        // );
      }
    });
  }
}
