import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { Clipboard } from '@angular/cdk/clipboard';


@Component({
  selector: 'app-parrainage',
  // standalone: true,
  //  imports: [],
  templateUrl: './parrainage.component.html',
  styleUrl: './parrainage.component.scss'
})
export class ParrainageComponent implements OnInit {

  @ViewChild('generateCodeTemplate') generateCodeTemplate: TemplateRef<any>;
  @ViewChild('codeGenerer') codeGenerer: TemplateRef<any>;
  
  

  public username: string;
  private currentUser: User;
  campagnes: any
  typePromo: any
  activeCampagne: any
  domHandlerService = inject(DomHandlerService);
  public form: UntypedFormGroup;


  public page: any;
  public count = 6;

  monCode:any=''

  constructor(
    public appService: AppService,
    public formBuilder: UntypedFormBuilder,
    private commonService: CommonMessageService,
    private auth: AuthenticationService,
    private productService: ProductService,
    private campagneService: CampagneService,
    private router: Router,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    public dialog: MatDialog,) { }



  ngOnInit(): void {
    this.currentUser = this.auth.currentUser()
    this.username = this.currentUser.username;

    this.getAllCampagne(this.username);
    this.getAllPromo();

    this.form = this.fb.group({
      campagne: ['', Validators.required],
      typePromo: ['', Validators.required]

    });
  }

  getAllCampagne(username) {
    this.campagneService.getAllCampagneByUsername(username).subscribe({
      next: (datas) => {
        this.campagnes = datas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.activeCampagne = datas
          .filter(campagne => campagne.active)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  getAllPromo() {
    this.campagneService.getAllTypePromo().subscribe({
      next: (datas) => {
        this.typePromo = datas;
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
    this.router.navigate(["/account/add-parrainage"])
  }



  public edit(id) {
    this.router.navigate(["/account/add-parrainage/" + id])
  }
  public detailCampagne(id) {
    this.router.navigate(["/account/detail-campagne/" + id])
  }



  public remove(campagne: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: {
        title: "Confirm Action",
        message: "Vous etes sur de supprimer cette campagne ?"
      }
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
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

  public updateState(id, state) {
    this.campagneService.updateState(id, state).then((data: any) => {
      console.log(data)
    })
  }

  setStatus(id: string, event: MatSlideToggleChange): void {
    this.updateState(id, event.checked ? 'true' : 'false')
  }
  public onPageChanged(event) {
    this.page = event;
    this.domHandlerService.winScroll(0, 0);
  }


  onNoClick(): void {
    this.dialog.closeAll();
  }
  generate() {
    try {
      if (this.form.valid) {
        const data = {
          campagneParrainage: this.form.value.campagne,
          username: this.username,
          typePromo: this.form.value.typePromo
        };
  
        this.campagneService.generateCode(data).subscribe({
          next: (datas) => {           
          
            this.monCode = datas.message
            this.dialog.closeAll()
            if(this.monCode != ''){
              this.openMyCode();
            }
              this.commonService.successToast(datas.message);
              this.router.navigate(["/account/parrainage"]);
           
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
      // console.log('The dialog was closed');
      this.router.navigate(["/account/parrainage"])

    });
  }

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
      this.router.navigate(['/account/parrainage']);
    });
  }
  

  public promo(key) {
    let res = ""
    switch (key) {
      case "POURCENTAGE":
        res = "Pourcentage"
        break;

      case "MONTANT_FIXE":
        res = "Montant fixe"
        break;

      case "LIVRAISON_GRATUITE":
        res = "Livraison gratuite"
        break;
      case "ACHAT_1_OFFERT":
        res = "Lors des premiers achats"
        break;
      case "CADEAU":
        res = "Cadeaux aux achats"
        break;
      case "POINTS_BONUS":
        res = "Des points en bonus"
        break;
      case "BON_ACHAT":
        res = "Le bon achat"
        break;
      case "PARRAINAGE":
        res = "Parrainage"
        break;
      case "ESSAI_GRATUIT":
        res = "Les essais gratuits"
        break;
      case "ABONNEMENT_REDUIT":
        res = "Abonnement"
        break;

      default:
        res = "N/A"
        break;
    }
    return res
  }

  copyCodeToClipboard() {
    if (this.monCode) {
      this.clipboard.copy(this.monCode);
      this.commonService.successToast('Code copié dans le presse-papiers !');
    } else {
      this.commonService.warnToast('Aucun code à copier.');
    }
  }

}
