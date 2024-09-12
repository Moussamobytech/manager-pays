import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { Influencer } from 'src/app/app.models';
import { AppSettings, Settings } from 'src/app/app.settings';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { FormBuilder } from '@angular/forms';
// import { InfluencerDialogComponent } from '../influencer-dialog/influencer-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { InfluencerService } from 'src/app/services/influencer.service';
import { InfluencerDialogComponent } from '../influencer-dialog/influencer-dialog.component';

@Component({
  selector: 'app-influencer-list',
  templateUrl: './influencer-list.component.html',
  styleUrl: './influencer-list.component.scss'
})
export class InfluencerListComponent implements OnInit{
  public influencer :Influencer []=[];
  public page: any;
  public count = 5;
  public settings:Settings;
  form = this.fb.group({
    etat : [null]
  })
  constructor(public influencerService:InfluencerService,  public fb : FormBuilder,public domHandlerService: DomHandlerService, public dialog: MatDialog, public appSettings:AppSettings){
    this.settings = this.appSettings.settings;

  }
  ngOnInit(): void {
    this.getInfluencers();
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }
  public async getInfluencers(){
    let data = await this.influencerService.list()
    this.influencer = data;
    console.log("Data influencer received ", this.influencer );
    
  }

  public openInfluencerDialog(data: any) {
    const dialogRef = this.dialog.open(InfluencerDialogComponent, {
      data: {
        influencer: data,
        influencers: this.influencer
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(influencers => {
      this.getInfluencers()
    });
  }

  public setEtatInfluencer(id: string, event: MatSlideToggleChange): void {
    // Trouver le influencer correspondant dans la liste
    const influencer = this.influencer.find(c => c.id === id);
    if (influencer) {
      // Mettre à jour l'état du influencer
      influencer.etat = event.checked;
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.influencerService.setEtat(id, event.checked).subscribe(
        () => {
          console.log(`Etat du influencer ${id} modifié avec succès à ${event.checked}.`);
          // Mettre à jour l'état du influencer dans votre application si nécessaire
        },
        error => {
          console.error("Erreur lors du réglage d'etat du influencer:", error);
          // Traiter les erreurs éventuelles lors de la modification d'etat du influencer
        }
      );
    }
  }

}
