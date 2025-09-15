import { ChangeDetectorRef, Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from 'src/app/app.service';
import { AppSettings, Settings } from 'src/app/app.settings';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { CategoryDialogComponent } from '../../products/categories/category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { CampagneDialogComponent } from '../campagne-dialog/campagne-dialog.component';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CampagneService } from 'src/app/services/campagne.service';
import { Campagne } from 'src/app/app.models';
import { Product } from 'src/app/models/product.models';
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
  monCode: any = '';
  activeCampagne: any;

  public form: UntypedFormGroup;
  currentUser: any;
  sortedCampagne: any[];

  constructor(
    private clipboard: Clipboard,
    private auth: AuthenticationService,
    private commonService: CommonMessageService,
    public appService: AppService,
    public campagneService: CampagneService,
    public fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public domHandlerService: DomHandlerService,
    private router: Router,
    public dialog: MatDialog,
    public appSettings: AppSettings
  ) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser();
    this.username = this.currentUser.username;
    this.form = this.fb.group({
      campagne: ['', Validators.required],
    });

    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    }
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

  openDialog(): void {
    const dialogRef = this.dialog.open(this.generateCodeTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.form.reset({
        campagne: '',
        typePromo: ''
      });
      this.router.navigate(['/admin/campagne/campagne-list']);
    });
  }

  public getCampagne() {
    this.campagneService.getAllCampagne().subscribe(data => {
      this.campagne = data;
      this.activeCampagne = data
        .filter(campagne => campagne.active)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.activeCampagne = [...this.activeCampagne];
      this.cdr.detectChanges();
    });
  }

  public getAllProducts() {
    this.appService.getAllProducts().subscribe(data => {
      this.products = data;
    });
  }

  public openCampagneDialog(id: any) {
    this.router.navigate(["/admin/campagne/add-campagne/" + id]);
  }

  public addCampagne() {
    this.router.navigate(["/admin/campagne/add-campagne"]);
  }

  public promo(key) {
    let res = "";
    switch (key) {
      case "PROMOTION":
        res = "Promotion";
        break;
      case "OFFRE_BIENVENUE":
        res = "Offre bienvenue";
        break;
      case "LIVRAISON_GRATUITE":
        res = "Livraison gratuite";
        break;
      case "PARRAINAGE":
        res = "Parrainage";
        break;
      default:
        res = "N/A";
        break;
    }
    return res;
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
      this.allCodesCampagne = null;
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
        this.appService.supprimerCampagne(campagne.id).subscribe(
          () => {
            const index: number = this.campagne.findIndex((cat: any) => cat.id === campagne.id);
            if (index !== -1) {
              this.campagne.splice(index, 1);
            }
            console.log("Category successfully deleted.");
          },
          (error) => {
            console.error("Error deleting category:", error);
          }
        );
      }
    });
  }

  openCampagneDetail(campagne: any): void {
    this.detailsCampagneData = campagne;
    const dialogRef = this.dialog.open(this.detailsCampagne, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.detailsCampagneData = null;
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
            const index: number = this.allCodesCampagne.findIndex((us: any) => us.id === code.id);
            if (index !== -1) {
              this.allCodesCampagne.splice(index, 1);
            }
            console.log("Campagne successfully deleted.");
          },
          (error) => {
            console.error("Error deleting produit:", error);
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
            this.monCode = datas.message;
            this.dialog.closeAll();
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
      this.router.navigate(["/admin/campagne/campagne-list"]);
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

  setStatus(id: string, event: any): void {
    const isChecked = event.target.checked;
    this.updateState(id, isChecked ? 'true' : 'false');
  }

  public updateState(id, state) {
    this.campagneService.updateState(id, state).then((data: any) => {
    });
  }

  sortCampagne(keyWord: string) {
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true;
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedCampagne = [...this.campagne].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });
    this[ascKey] = !isAscending;
    this.cdr.detectChanges();
  }

  getSortValue(campagne: any, keyWord: string): any {
    switch (keyWord) {
      case "nom":
        return campagne.nom ? campagne.nom.trim().toLowerCase() : '';
      case "username":
        return campagne.createdByUser ? campagne.createdByUser.trim().toLowerCase() : '';
      case "typePromo":
        return campagne.typePromo ? campagne.typePromo.trim().toLowerCase() : '';
      case "dateDebut":
        return campagne.dateDebut ? new Date(campagne.dateDebut).getTime() : 0;
      case "dateFin":
        return campagne.dateFin ? new Date(campagne.dateFin).getTime() : 0;
      default:
        return '';
    }
  }
}