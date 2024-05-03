import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/app.service';
import { Brand } from 'src/app/app.models';
import { AppSettings, Settings } from 'src/app/app.settings';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { FormBuilder } from '@angular/forms';
import { BrandDialogComponent } from '../brand-dialog/brand-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnInit{
  public brand :Brand []=[];
  public page: any;
  public count = 5;
  public settings:Settings;
  form = this.fb.group({
    etat : [null]
  })
  constructor(public appService:AppService,  public fb : FormBuilder,public domHandlerService: DomHandlerService, public dialog: MatDialog, public appSettings:AppSettings){
    this.settings = this.appSettings.settings;

  }
  ngOnInit(): void {
    this.getBrands();
  }
  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }
  public getBrands(){
    this.appService.getBrands().subscribe((data) => {

      this.brand = data;
      console.log("Data received ", this.brand );
  });
  }

  public openBrandDialog(data: any) {
    const dialogRef = this.dialog.open(BrandDialogComponent, {
      data: {
        brand: data,
        brands: this.brand
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(brands => {
      this.getBrands()
      // if (brands) {
      //   const index: number = this.brand.findIndex(x => x.id === brands.id);
      //   if (index !== -1) {
      //     // Si le brand existe déjà, mettez à jour ses données
      //     this.brand[index] = brands;
      //   } else {
      //     // Si le brand n'existe pas, ajoutez-la à la liste
      //     const lastBrand = this.brand[this.brand.length - 1];
      //     brands.id = lastBrand.id + 1;
      //     this.brand.push(brands);
      //   }
      // }
    });
  }

  public setEtatBrand(id: string, event: MatSlideToggleChange): void {
    // Trouver le brand correspondant dans la liste
    const brand = this.brand.find(c => c.id === id);
    if (brand) {
      // Mettre à jour l'état du brand
      brand.etat = event.checked;
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.appService.setEtatBrand(id, event.checked).subscribe(
        () => {
          console.log(`Etat du brand ${id} modifié avec succès à ${event.checked}.`);
          // Mettre à jour l'état du brand dans votre application si nécessaire
        },
        error => {
          console.error("Erreur lors du réglage d'etat du brand:", error);
          // Traiter les erreurs éventuelles lors de la modification d'etat du brand
        }
      );
    }
  }

}
