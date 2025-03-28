import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { Caracteristiques } from 'src/app/app.models';
import { AppSettings, Settings } from 'src/app/app.settings';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { FormBuilder } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CaracteristiquesService } from 'src/app/services/caracteristiques.service';
import { DialogComponent } from '../modals/dialog.component';

@Component({
  selector: 'app-caracteristiques-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class CaracteristiquesListComponent implements OnInit{
  public caracteristiques :Caracteristiques []=[];
  public page: any;
  public count = 5;
  public settings:Settings;
  form = this.fb.group({
    etat : [null]
  })
  constructor(public appService:CaracteristiquesService,  public fb : FormBuilder,public domHandlerService: DomHandlerService, 
    public dialog: MatDialog, public appSettings:AppSettings){
    this.settings = this.appSettings.settings;

  }
  ngOnInit(): void {
    this.getCaracteristiques();
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }
  public getCaracteristiques(){
    this.appService.getCaracteristiques().subscribe((data) => {

      this.caracteristiques = data;
      console.log("Data received ", this.caracteristiques );
    });
  }

  public openCaracteristiquesDialog(data: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        caracteristique: data,
        caracteristiques: this.caracteristiques
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(caracteristiquess => {
      this.getCaracteristiques()
      
    });
  }

  // public setEtatCaracteristiques(id: string, event: MatSlideToggleChange): void {
  //   // Trouver le caracteristiques correspondant dans la liste
  //   const caracteristiques = this.caracteristiques.find(c => c.id === id);
  //   if (caracteristiques) {
  //     // Mettre à jour l'état du caracteristiques
  //     caracteristiques.etat = event.checked;
  //     // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
  //     this.appService.setEtatCaracteristiques(id, event.checked).subscribe(
  //       () => {
  //         console.log(`Etat du caracteristiques ${id} modifié avec succès à ${event.checked}.`);
  //         // Mettre à jour l'état du caracteristiques dans votre application si nécessaire
  //       },
  //       error => {
  //         console.error("Erreur lors du réglage d'etat du caracteristiques:", error);
  //         // Traiter les erreurs éventuelles lors de la modification d'etat du caracteristiques
  //       }
  //     );
  //   }
  // }

}
