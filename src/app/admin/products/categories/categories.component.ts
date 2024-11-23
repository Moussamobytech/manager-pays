import { Component, OnInit, inject } from '@angular/core';
import { Category } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { AppSettings, Settings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public categories:Category[] = [];
  public tous:any
  public page: any;
  public count = 6;
  domHandlerService = inject(DomHandlerService);
  public settings:Settings;
  constructor(public appService: AppService, public dialog: MatDialog, public appSettings:AppSettings) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit(): void {
    this.getCategories();
  }

  public getCategories(){
    this.appService.getCategories().subscribe(data => {
      this.categories = data;
      // this.categories.shift();
      console.log('Categories ', this.categories);
    });
  }

  public onPageChanged(event){
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }

  public openCategoryDialog(data:any){
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: {
        category: data,
        categories: this.categories
      },
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(category => {
      if(category){
        const index: number = this.categories.findIndex(x => x.id == category.id);
        if(index !== -1){
          this.categories[index] = category;
        }
        else{
          let last_category = this.categories[this.categories.length - 1];
          category.id = last_category.id + 1;
          this.categories.push(category);
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
        this.appService.supprimerCategorie(category.id).subscribe(
          () => {
            // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
            const index: number = this.categories.findIndex((cat: any) => cat.id === category.id);
            if (index !== -1) {
              this.categories.splice(index, 1);
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
  // dialogRef.componentInstance.categoryAdded.subscribe(() => {
  //   // Actualiser la liste des catégories ici
  //   this.refreshCategoryList();
  // });

  refreshCategoryList() {

    this.appService.getCategories().subscribe(data => {
      this.tous = data;
      console.log('Categoriesss ', this.tous);
    });
    // Appeler le service ou effectuer toute autre opération pour récupérer à nouveau la liste des catégories
  }


  public setStatus(id: string, status: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: `Are you sure you want to set the status of this category to ${status}?`
      }
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        // Si l'utilisateur confirme dans la boîte de dialogue
        this.appService.setStatus(id, status).subscribe(
          () => {

            console.log(`Status of category successfully set to ${status}.`);
            // Mettre à jour l'état de la catégorie dans votre application si nécessaire
          },
          error => {
            console.error("Error setting category status:", error);
            // Traiter les erreurs éventuelles lors de la modification du statut de la catégorie
          }
        );
      }
    });
  }


  // public setStatus(id: string, event: MatSlideToggleChange): void {
  //   // Trouver la categorie correspondant dans la liste
  //   const categorie = this.categories.find(c => c.id === id);
  //   if (categorie) {
  //     // Mettre à jour l'état du brand
  //     categorie.status = event.checked.toString();

  //     this.appService.setStatus(id, event.checked.toString()).subscribe(
  //       () => {
  //         console.log(`État de la catégorie ${id} modifié avec succès à ${event.checked}.`);
  //         // Mettre à jour l'état de la catégorie dans votre application si nécessaire
  //       },
  //       error => {
  //         console.error("Erreur lors du réglage d'état de la catégorie:", error);
  //         // Traiter les erreurs éventuelles lors de la modification d'état de la catégorie
  //       }
  //     );
  //   }
  // }


}
