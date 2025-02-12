import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('popupTemplate') popupTemplate: TemplateRef<any>;

  rechargeForm: FormGroup;
  rechargeAmount: number;
  public form: UntypedFormGroup;
  public username: any;
  points: any = 0;
  currentUser: any;
  statsNumber: any = {
    total: 0,
    actif: 0,
    inactif: 0,
    pending: 0,
    contact: 0,
  };

  // Extra properties from branch 2
  isCopied: boolean = false;
  shopLink: string = null;

  constructor(
    private auth: AuthenticationService,
    private productService: ProductService,
    private router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.currentUser();

    // Initialize shopLink (this version uses the /sellers/ URL – adjust as needed)
    this.shopLink = "https://fidelity-market.com/#/sellers/" + this.currentUser.username;

    // Check if the user is logged in and has profiles; otherwise redirect to sign in
    if (this.currentUser == null || this.currentUser.profiles == null || this.currentUser.profiles == undefined) {
      this.router.navigate(["/sign-in"]);
    }

    this.stats(this.currentUser.username);

    // Build the recharge form
    this.form = this.fb.group({
      amount: ['', Validators.required]
    });

    this.getUserById();
  }

  /**
   * Navigates to the add product page.
   * (From branch 2 – adjust the route if needed.)
   */
  public add() {
    this.router.navigate(["/account-seller/products-seller/add-product"]);
  }

  /**
   * Returns a human-readable profile name based on the role.
   */
  currentProfile(roles) {
    if (!roles) {
      return 'N/A';
    }
    let key = roles.name;
    let profil = "";
    switch (key) {
      case "ROLE_PARTICULIER":
        profil = "particulier";
        break;
      case "ROLE_BOUTIQUE":
        profil = "Boutique";
        break;
      case "ROLE_ADMIN":
        profil = "Administrateur";
        break;
      case "ROLE_USER":
        profil = "Utilisateur";
        break;
      default:
        profil = "N/A";
        break;
    }
    return profil;
  }

  /**
   * Retrieves various statistics from the product service.
   */
  public stats(id) {
    this.productService.stats(id).then((data: any) => {
      this.statsNumber.total = data.total;
      this.statsNumber.actif = data.actif;
      this.statsNumber.inactif = data.inactif;
      this.statsNumber.pending = data.pending;
      this.statsNumber.contact = data.contact;
    });
  }

  /**
   * Closes all open dialogs.
   */
  onNoClick(): void {
    this.dialog.closeAll();
  }

  /**
   * Opens a dialog using the provided template and, upon closing, navigates to the dashboard.
   * (Note: This uses `/account/dashboard` as the route – change to `/account-seller/dashboard` if needed.)
   */
  openDialog(): void {
    const dialogRef = this.dialog.open(this.popupTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(["/account-seller/dashboard"]);
    });
  }

  /**
   * Retrieves user details by ID.
   */
  getUserById() {
    this.auth.info(this.currentUser.username).then((data: any) => {
      this.username = data;
      this.points = data.points;
    });
  }

  /**
   * Executes a recharge request if the form is valid.
   */
  onRecharge() {
    if (this.form.valid) {
      const amount: number = +this.form.get('amount').value; // Convert the amount to a number
      this.auth.recharge(amount, this.currentUser.id).subscribe(
        response => {
          this.points = response.points;
          setTimeout(() => {
            this.dialog.closeAll();
          }, 3000);
        },
        error => {
          this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          console.error('Error during recharge:', error);
        }
      );
    }
  }

  /**
   * Opens WhatsApp with a preset message.
   * (From branch 1)
   */
  WhatsAppUs() {
    let message = "Bonjour, j’aimerais promouvoir mes produits sur Fidelity Market.";
    const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
    window.open(link, "_blank");
  }

  /**
   * Copies the shop link to the clipboard and toggles a visual flag.
   * (From branch 2)
   */
  copyLink(inputElement: HTMLInputElement): void {
    inputElement.style.transition = '.3s';
    navigator.clipboard.writeText(this.shopLink).then(
      () => {
        this.isCopied = true;
        setTimeout(() => (this.isCopied = false), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }
}
