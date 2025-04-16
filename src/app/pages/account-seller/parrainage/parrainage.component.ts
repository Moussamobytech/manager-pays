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

interface Campaign {
  type: 'bienvenue' | 'promo' | 'parrainage' | 'livraison';
  title: string;
  value: string;
  info: string;
  active: boolean;
  extra?: string;
}

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
  @ViewChild('detailsCampagne') detailsCampagne: TemplateRef<any>;
  @ViewChild('allCodeGenerer') allCodeGenerer: TemplateRef<any>;



  public username: string;
  private currentUser: User;
  campagnes: any
  typePromo: any
  activeCampagne: any
  domHandlerService = inject(DomHandlerService);
  public form: UntypedFormGroup;


  public page: any;
  public count = 6;

  monCode: any = ''
  detailsCampagneData: any;
  allCodesCampagne: any = [];
  sellerInfo: any = JSON.parse(sessionStorage.getItem('currentUser')!);
  shopLink: string = window.location.origin + '/#/sellers/' + this.sellerInfo.username;

// ----------------------------------------------------------------------------------------------------------------
  campaignTypes = [
    {
      icon: '👋',
      title: 'Bienvenue',
      desc: 'Pour nouveaux clients',
      objective: 'Attirer de nouveaux clients avec une offre spéciale pour leur premier achat.',
      steps: [
        'Offrez une réduction fixe, en pourcentage ou en produit aux nouveaux clients.',
        'Applicable une seule fois par client.',
        'Idéal pour encourager le premier achat.'
      ],
      advantages: [
        'Augmenter le nombre de clients.',
        'Créer une première impression positive.',
        'Facile à mettre en place et à suivre.'
      ],
      type: 'bienvenue'
    },
    {
      icon: 'fa-solid fa-tags',
      title: 'Promo',
      desc: 'Réductions spéciales',
      objective: 'Stimuler les ventes avec une réduction temporaire sur certains produits.',
      steps: [
        'Définissez une réduction en pourcentage ou montant fixe.',
        'Choisissez une date de début et de fin.',
        'Applicable à tous vos produits ou à quelques produits.'
      ],
      advantages: [
        'Booster rapidement vos ventes.',
        'Ecouler rapidement vos stocks.',
        'Attirer des nouveaux clients.'
      ],
      type: 'promo'
    },
    {
      icon: 'fa-solid fa-people-arrows',
      title: 'Parrainage',
      desc: 'Récompensez vos clients',
      objective: 'Encourager vos clients actuels à recommander votre boutique à leurs amis.',
      steps: [
        'Le client partage son code ou lien unique avec ses amis.',
        "Ses amis obtiennent une réduction sur leur premier achat.",
        "Le client reçoit une récompense pour chaque achat par ses amis."
      ],
      advantages: [
        "Marketing gratuit par bouche-à-oreille.",
        "Acquérir des clients de confiance.",
        "Fidéliser vos clients existants."
      ],
      type: 'parrainage'
    },
    {
      icon: '🚚',
      title: 'Livraison',
      desc: 'Livraison gratuite',
      objective: "Encourager des achats plus importants en offrant la livraison gratuite.",
      steps: [
        "Fixez un montant minimum d'achat.",
        "Offrez la livraison gratuite quand ce montant est atteint.",
        "Choisissez une date de début et de fin."
      ],
      advantages: [
        "Augmenter les achats par vos clients.",
        "Éliminer un frein à l'achat.",
        "Améliorer la satisfaction client."
      ],
      type: 'livraison'
    }
  ];

  // Mock active campaigns
  campaigns: Campaign[] = [
    {
      type: 'bienvenue',
      title: 'Bienvenue Nouveaux Clients',
      value: '2000 F',
      info: 'Utilisable : 1 fois',
      active: true
    },
    {
      type: 'promo',
      title: 'Promo Tabaski',
      value: '-20%',
      info: 'Expire : 30/05/2025',
      active: true
    },
    {
      type: 'parrainage',
      title: 'Programme Parrainge',
      value: '1000 F',
      info: 'Par ami parraine',
      active: false
    },
    {
      type: 'livraison',
      title: 'Livraison Offerte',
      value: 'Pour achats > 20 000F',
      info: 'Expire : 30/05/2025',
      active: false
    }
  ];
  selectedCampaign = this.campaignTypes[0];
  isOpen: boolean = true;
  loadIndex: number = 4;
// ----------------------------------------------------------------------------------------------------------------

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
    this.router.navigate(["/account-seller/add-parrainage"])
  }



  public edit(id) {
    this.router.navigate(["/account-seller/add-parrainage/" + id])
  }
  public detailCampagne(id) {
    this.router.navigate(["/account-seller/detail-campagne/" + id])
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
      this.router.navigate(["/account-seller/parrainage"])

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




  openCampagneAllCode(id: any): void {

    this.campagneService.getAllCodeByCampagne(id).subscribe({
      next: (datas) => {
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
      this.router.navigate(['/account-seller/parrainage']);
    });
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

  copyCodeToClipboard() {
    if (this.monCode) {
      this.clipboard.copy(this.shopLink + '/' + this.monCode);
      this.commonService.successToast('Code copié dans le presse-papiers !');
    } else {
      this.commonService.warnToast('Aucun code à copier.');
    }
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
          },
          (error) => {
            console.error("Error deleting produit:", error);
            // Traiter les erreurs éventuelles lors de la suppression de la catégorie
          }
        );
      }
    });
  }


// ----------------------------------------------------------------------------------------------------------------
  onAddCampaign(type: string) {
    // put logics
    console.log('Add campaign of type:', type);
  }

  onEditCampaign(campaign: Campaign) {
    // put logics
    console.log('Edit campaign:', campaign);
  }

  onToggleCampaign(campaign: Campaign) {
    campaign.active = !campaign.active;
  }

  onLoadMore() {
    this.loadIndex += 4;
  }

  getCampaignIcon(type: string): string {
    return this.campaignTypes.find(t => t.type === type)?.icon;
  }

  selectCampaign(campaign) {
    this.selectedCampaign = campaign;
  }
// ----------------------------------------------------------------------------------------------------------------

}
