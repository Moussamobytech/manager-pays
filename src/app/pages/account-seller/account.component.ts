import { Component, OnInit, ViewChild, HostListener, TemplateRef } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { DomHandlerService } from 'src/app/dom-handler.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  constructor(
    public router: Router,
    public domHandlerService: DomHandlerService,
    public translateService: TranslateService,
    private auth: AuthenticationService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private imgCompressService: ImageCompressService
  ) {}

  @ViewChild('sidenav', { static: true }) sidenav: any;
  @ViewChild('FilePopupTemplate') FilePopupTemplate: TemplateRef<any>;
  public sidenavOpen: boolean = true;
  public currentUser: any = this.auth.currentUser();
  public LogoForm: UntypedFormGroup;
  defaultLogo = 'assets/images/icons/shop_icon.png';
  selectedLogo: File | null = null;
  selectedLogoName: string = null;
  public links =  [
    { name: 'Dashboard', href: 'dashboard', icon: 'dashboard' },
    { name: 'Parrainage', href: 'parrainage', icon: 'people' },
    { name: 'Mes produits', href: 'products-seller', icon: 'add_shopping_cart' },
    { name: 'Mes clients', href: 'customers', icon: 'people_outline' },
    { name: 'Mes commandes', href: 'orders-manage', icon: 'shop' },
    { name: 'Mes achats', href: 'orders', icon: 'shopping_cart' },
    { name: 'Informations', href: 'information', icon: 'info_outline' },
    { name: 'Comment ca marche?', href: 'how_works', icon: 'help_outline' },
    { name: 'Déconnection', href: '/sign-in', icon: 'power_settings_new' },
  ];

  async ngOnInit() {
    if (this.domHandlerService.window?.innerWidth < 960) {
      this.sidenavOpen = false;
    }

    let home = await this.translateService.instant('NAV.HOME');
    let setting = this.translateService.instant('NAV.SETTING');
    let produits = this.translateService.instant('NAV.ALL_PRODUCTS');
    let logout = this.translateService.instant('LOGOUT');

    // Initialize the logo form
    this.LogoForm = this.fb.group({
      'logo': [null, Validators.required]
    });
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.sidenavOpen = (this.domHandlerService.window?.innerWidth < 960) ? false : true;
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.domHandlerService.window?.innerWidth < 960) {
          this.sidenav.close();
        }
      }
    });
  }

  onLogoChose() {
    try {
      if (this.LogoForm.valid) {
        let logo: File = this.selectedLogo;
        let isFileAllowed: boolean = logo.type.includes("image/");
        // Ajout du logo
        if (isFileAllowed) {
          if (logo) {
            this.imgCompressService.compressImage(logo, 1200, 800, 70).then(async (Bloblogo) => {
              // Convert Blob to File
              const randomName = `logo-${Math.random().toString(36).substring(2, 15)}.jpeg`;
              let editedLogo = new File([Bloblogo], randomName, { type: Bloblogo.type });
              await this.auth.uploadImange(this.currentUser.username, editedLogo).toPromise();
              this.currentUser = await this.auth.info(this.currentUser.username);
              this.onNoClick();
            });
          }
        } else {
          this.snackBar.open("Format incorrect, veillez choisir une image!", "x", { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      } else {
        this.snackBar.open("Veuillez choisir un logo puis réessayer!", "x", { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  openFileDialog(): void {
    const dialogRef = this.dialog.open(this.FilePopupTemplate, {
      // width: '300px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(["/account-seller/dashboard"]);
    });
  }

  onNoClick(): void {
    this.dialog.closeAll();
    this.selectedLogo = null;
    this.selectedLogoName = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      let logoName = this.selectedLogo.name;
      if (logoName.length > 15) {
        this.selectedLogoName = logoName.substring(0, 8) + '...' + logoName.substring(logoName.length - 4);
      } else {
        this.selectedLogoName = logoName;
      }
    }
  }
}
