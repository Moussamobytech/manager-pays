import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { Campagne, Product } from 'src/app/app.models';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { CategoryDialogComponent } from '../../products/categories/category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CampagneDialogComponent } from '../campagne-dialog/campagne-dialog.component';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CampagneService } from 'src/app/services/campagne.service';
import { Campagne } from 'src/app/app.models';
import { Product } from 'src/app/models/product.models';
import { state } from '@angular/animations';
import { id } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthenticationService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-campagne-list',
  templateUrl: './campagne-list.component.html',
  styleUrl: './campagne-list.component.scss'
})

export class CampagneListComponent implements OnInit {
  @ViewChild('generateCodeTemplate') generateCodeTemplate: TemplateRef<any>;
  @ViewChild('codeGenerer') codeGenerer: TemplateRef<any>;
  @ViewChild('detailsCampagne') detailsCampagne: TemplateRef<any>;
  @ViewChild('allCodeGenerer') allCodeGenerer: TemplateRef<any>;


  public viewCol: number = 25;
  public campagne: Array<Campagne> = [];
  public page: any;
  public count = 10;
  public settings: Settings;
  public id: string;
  public products: Array<Product> = [];
  detailsCampagneData: any;
  allCodesCampagne: any = [];
  sellerInfo: any = JSON.parse(sessionStorage.getItem('currentUser')!);
  shopLink: string = window.location.origin + '/#/sellers/' + this.sellerInfo.username;
  public username: string;
  monCode: any = ''
  activeCampagne: any



  public form: UntypedFormGroup;
  currentUser: any;

  constructor(
    private clipboard: Clipboard,
    private auth: AuthenticationService,
    private commonService: CommonMessageService,
    public appService: AppService, 
    public campagneService: CampagneService,
    public fb: FormBuilder,
    public domHandlerService: DomHandlerService,
    private router: Router, public dialog: MatDialog, 
    public appSettings: AppSettings) {
    this.settings = this.appSettings.settings;


  }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.username = this.currentUser.username;
    this.form = this.fb.group({
      campagne: ['', Validators.required],

    });

    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    };
    this.getCampagne();

  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }
  public onPageChanged(event) {
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


  openDialog(): void {
    const dialogRef = this.dialog.open(this.generateCodeTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Reset form fields after the dialog is closed
      this.form.reset({
        campagne: '',
        typePromo: ''
      });

      // Navigate to the desired route
      this.router.navigate(['/admin/campagne/campagne-list']);
    });
  }
  public getCampagne() {
    this.campagneService.getAllCampagne().subscribe(data => {
      this.campagne = data;
      this.activeCampagne = data
        .filter(campagne => campagne.active)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log("campagne :", this.campagne)
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }
  public getAllProducts() {
    this.appService.getAllProducts().subscribe(data => {
      this.products = data;
      console.log("Produit :", this.products)
      //for show more product
      // for (var index = 0; index < 3; index++) {
      //   this.products = this.products.concat(this.products);
      // }
    });
  }
  public openCampagneDialog(id: any) {

    this.router.navigate(["/admin/campagne/add-campagne/" + id])
  }
  public addCampagne() {
    this.router.navigate(["/admin/campagne/add-campagne"])

  }

  public promo(key) {
    let res = ""
    switch (key) {
      case "PROMOTION":
        res = "Promotion"
        break;

      case "OFFRE_BIENVENUE":
        res = "Offre bienvenue"
        break;

      case "LIVRAISON_GRATUITE":
        res = "Livraison gratuite"
        break;

      case "PARRAINAGE":
        res = "Parrainage"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }
  openCampagneAllCode(id: any): void {

    this.campagneService.getAllCodeByCampagne(id).subscribe({
      next: (datas) => {
        console.log("::::::::::: TEST ", JSON.stringify(datas));

        this.allCodesCampagne = datas;

      },
      error: (err) => {
        if (err && err.statusCode == "BAD_REQUEST") {
          this.commonService.errorToast(err.body.message);
        } else {
          this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
        }
      }
    });

    const dialogRef = this.dialog.open(this.allCodeGenerer, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.allCodesCampagne = null; // Réinitialiser après fermeture
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

  openCampagneDetail(campagne: any): void {
    this.detailsCampagneData = campagne; // Stocker l'objet sélectionné
    const dialogRef = this.dialog.open(this.detailsCampagne, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.detailsCampagneData = null; // Réinitialiser après fermeture
    });
  }
  copyCodeToClipboard2(monCode) {
    if (monCode) {
      this.clipboard.copy(this.shopLink + '/' + monCode);
      this.commonService.successToast('Code copié dans le presse-papiers !');
    } else {
      this.commonService.warnToast('Aucun code à copier.');
    }
  }


  public removeCode(code: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous etes sur de vouloir supprimer ce code ?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.campagneService.supprimerCode(code.id).subscribe(
          () => {
            // Supprimer la catégorie localement après avoir été supprimée avec succès sur le serveur
            const index: number = this.allCodesCampagne.findIndex((us: any) => us.id === code.id);
            if (index !== -1) {
              this.allCodesCampagne.splice(index, 1);
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

  onNoClick(): void {
    this.dialog.closeAll();
  }
  generate() {
    try {
      if (this.form.valid) {
        const data = {
          campagneParrainage: this.form.value.campagne,
          username: this.username
        };

        this.campagneService.generateCode(data).subscribe({
          next: (datas) => {

            this.monCode = datas.message

            this.dialog.closeAll()
            if (this.monCode != '') {
              this.openMyCode();
            }
            this.commonService.successToast(datas.message);
            this.router.navigate(["/admin/campagne/campagne-list"]);

          },
          error: (err) => {
            if (err && err.statusCode == "BAD_REQUEST") {
              this.commonService.errorToast(err.body.message);
            } else {
              this.commonService.errorToast("Une erreur interne est survenue, merci de réessayer !");
            }
          }
        });

      } else {
        this.commonService.warnToast("Merci de vérifier si tous les champs sont remplis");
      }
    } catch (error) {
      console.log(error);
      this.commonService.errorToast("Erreur inattendue, merci de réessayer !");
    }
  }

  openMyCode(): void {
    const dialogRef = this.dialog.open(this.codeGenerer, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(["/admin/campagne/campagne-list"])

    });
  }

  copyCodeToClipboard() {
    if (this.monCode) {
      this.clipboard.copy(this.shopLink + '/' + this.monCode);
      this.commonService.successToast('Code copié dans le presse-papiers !');
    } else {
      this.commonService.warnToast('Aucun code à copier.');
    }
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


  setStatus(id: string, event: MatSlideToggleChange): void {
    this.updateState(id, event.checked ? 'true' : 'false')
  }
  public updateState(id, state) {
    this.campagneService.updateState(id, state).then((data: any) => {
      console.log(data)
    })
  }

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
