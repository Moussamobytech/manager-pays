import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.models';
import { AppService } from 'src/app/app.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CampagneService } from 'src/app/services/campagne.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ProductService } from 'src/app/services/product.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomHandlerService } from 'src/app/dom-handler.service';

@Component({
  selector: 'app-parrainage',
 // standalone: true,
//  imports: [],
  templateUrl: './parrainage.component.html',
  styleUrl: './parrainage.component.scss'
})
export class ParrainageComponent implements OnInit{
  public username:string;
  private currentUser: User;
  campagnes:any
  domHandlerService = inject(DomHandlerService);


  public page: any;
  public count = 6;

  constructor(
    public appService: AppService, 
    public formBuilder: UntypedFormBuilder, 
    private commonService: CommonMessageService,
    private auth: AuthenticationService, 
    private productService: ProductService, 
    private campagneService: CampagneService,
    private router: Router,
    private fb: FormBuilder,
  public dialog: MatDialog,) { }



  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.username = this.currentUser.username;     
    
    this.getAllCampagne(this.username);
  }

getAllCampagne(username){
  this.campagneService.getAllCampagneByUsername(username).subscribe({
    next: (datas) => {           
      this.campagnes = datas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    error: (err) => {
      if (err && err.statusCode == "BAD_REQUEST") {
        this.commonService.errorToast(err.body.message);
      } else {
        this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
      }
    }
  });
}

add() {
  this.router.navigate(["/account/add-parrainage"])}



    public edit(id){
      this.router.navigate(["/account/add-parrainage/"+id])
    }
  
  
    public remove(campagne:any){
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: {
          title: "Confirm Action",
          message: "Vous etes sur de supprimer cette campagne ?"
        }
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if(dialogResult){
          this.campagneService.supprimer(campagne.id).subscribe(
            () => {
              // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
              const index: number = this.campagnes.findIndex((us: any) => us.id === campagne.id);
              if (index !== -1) {
                this.campagnes.splice(index, 1);
              }
              console.log("Campagne successfully deleted.");
            },
            (error) => {
              console.error("Error deleting produit:", error);
              // Traiter les erreurs éventuelles lors de la suppression de la catégorie
            }
          );
        }
      });
    }
  
    public updateState(id, state){
      this.campagneService.updateState(id, state).then((data : any) =>{
        console.log(data)
      })
    }
  
    setStatus(id: string, event: MatSlideToggleChange): void {
      // Appeler le service ou effectuer d'autres actions nécessaires pour sauvegarder les modifications
      this.updateState(id, event.checked ? 'true' : 'false')  
    }
    public onPageChanged(event){
      this.page = event;
      this.domHandlerService.winScroll(0, 0);
    }

}
