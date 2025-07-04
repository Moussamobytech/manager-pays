import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map, catchError, finalize } from 'rxjs';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { CommandeSearchPipe } from 'src/app/theme/pipes/commandeSearche.pipe';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';

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
  // statsNumber: any = {
  //   total: 0,
  //   actif: 0,
  //   inactif: 0,
  //   pending: 0,
  //   contact: 0,
  // };
  isCopied: boolean = false;
  sellerInfo: any = JSON.parse(sessionStorage.getItem('currentUser')!);
  shopLink: string = window.location.origin + environment.baseHref + '/#/sellers/' + this.sellerInfo.username;
  commandes: any;
  commandePending: any = 0;
  commandeTotal: any = 0;
  venteTotal: any = 0;
  montantTotal: any = 0;
  commandeTotalMensuel: any = 0;
  pourcentageEvolution: any = 0;
  montantTotalMensuel: any = 0;
  visitTotal: any = 0;

  // cards = [
  //   { icon: 'fas fa-cart-shopping', title: 'Commandes en attente', content: 'Consulter maintenant', value: null, cardClass: 'amber', routerLink: '/account-seller/orders'},
  //   { icon: 'fas fa-clipboard-list', title: 'Produits actifs', content: 'Ajouter des produits', value: null, cardClass: 'primary', routerLink: '/account-seller/products-seller'},
  //   { icon: 'fas fa-search', title: 'Visiteurs', content: 'Pour mes produits', value: null, cardClass: 'primary', routerLink: '#'},
  //   { icon: 'fas fa-chart-line', title: 'Ventes du mois', content: null, value: null, cardClass: 'amber', routerLink: '#'},
  // ];

  constructor(
    private auth: AuthenticationService,
    private productService: ProductService,
    private ngxSpinnerService: NgxSpinnerService,
    private router: Router,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cm: CommonService,
    private commandeService: CommandeService,
    private commonService: CommonMessageService
  ) { }

  cards = [
    { icon: 'fas fa-cart-shopping', title: 'Commandes en attente', content: 'Consulter maintenant', value: 0, cardClass: 'amber', routerLink: '/account-seller/orders' },
    { icon: 'fas fa-clipboard-list', title: 'Produits actifs', content: 'Ajouter des produits', value: 0, cardClass: 'primary', routerLink: '/account-seller/products-seller' },
    { icon: 'fas fa-search', title: 'Visiteurs', content: 'Pour mes produits', value: 0, cardClass: 'primary', routerLink: '/account-seller/dashboard' },
    { icon: 'fas fa-chart-line', title: 'Ventes du mois', content: '1000 F', value: '+10%', cardClass: 'amber', routerLink: '/account-seller/dashboard' },
  ];

  ngOnInit() {
    this.currentUser = this.auth.currentUser();
    //    console.log("VISIT PENDING :::::::::: = ",this.visitTotal);


    // Initialize shopLink (using the seller URL pattern)
    //    this.shopLink = "http://localhost:4200/#/sellers/" + this.currentUser.username;

    // If user is not logged in or profiles are missing, redirect to sign-in.
    if (this.currentUser == null || this.currentUser.profiles == null || this.currentUser.profiles == undefined) {
      this.router.navigate(["/authentication"]);
    }

    // Retrieve product statistics.
    this.stats(this.currentUser.username);

    // Build the recharge form.
    this.form = this.fb.group({
      amount: ['', Validators.required]
    });

    this.getUserById();

    this.getProductViewCount(this.currentUser.username);

    console.log("Current User :::::::::: = ", this.currentUser.username);

    this.getCommandes(this.currentUser.username);
  }

  /**
   * Navigates to the add product page.
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
      // this.statsNumber.total = data.total;
      // this.statsNumber.actif = data.actif;
      this.cards[1].value = data.actif;

      // this.statsNumber.inactif = data.inactif;
      // this.statsNumber.pending = data.pending;
      // this.statsNumber.contact = data.contact;
    });
  }

  /**
   * Closes all open dialogs.
   */
  onNoClick(): void {
    this.dialog.closeAll();
  }

  /**
   * Opens the recharge dialog.
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
   * Retrieves user details by username.
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
  // onRecharge() {
  //   if (this.form.valid) {
  //     const amount: number = +this.form.get('amount').value;
  //     this.auth.recharge(amount, this.currentUser.id).subscribe(
  //       response => {
  //         this.points = response.points;
  //         setTimeout(() => {
  //           this.dialog.closeAll();
  //         }, 3000);
  //       },
  //       error => {
  //         this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', {
  //           panelClass: 'error',
  //           verticalPosition: 'top',
  //           duration: 3000
  //         });
  //         console.error('Error during recharge:', error);
  //       }
  //     );
  //   }
  // }

  /**
   * Opens WhatsApp with a preset message.
   */
  WhatsAppUs() {
    let message = "Bonjour, j’aimerais promouvoir mes produits sur Fidelity Market.";
    const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
    window.open(link, "_blank");
  }

  shareLink(El: HTMLElement) {
    const shareData = {
      title: '',
      text: 'Découvrez cette boutique sur Fidelity-Market 💥: ' + this.currentUser.nom + ' !',
      url: this.shopLink
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((error) => console.error('Erreur lors de l\'envoie: ', error));
    } else {
      this.cm.openWarningSnackBar("Partage non supporté sur ce navigateur, Lien copié !");
      this.copyLink(El);
    }
  }

  /**
   * Copies the shop link to the clipboard and toggles a visual flag.
   */
  copyLink(element: HTMLElement): void {
    element.style.transition = '.3s';
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

  /**
   * Retrieves orders (commandes) for the given user and computes statistics.
   */
  public async getCommandes(id) {
    // Show the spinner before starting the request.
    this.ngxSpinnerService.show();
    await this.commandeService.getAllCommandeByUsername(id).pipe(
      map((commande: any) => commande),
      catchError((error: any) => {
        console.error("Erreur lors de la récupération des commandes : ", error);
        this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
        return []; // Retourne une liste vide en cas d'erreur pour éviter les plantages
      }),
      finalize(() => {
        this.ngxSpinnerService.hide();// Masquez le spinner une fois la requête terminée (succès ou erreur)
      })
    ).subscribe((data: any) => {

      // Filtrer les données pour ne garder que les commandes avec le statut "PENDING"
      const pendingData = data.filter((commande: any) => commande.statutCommande.name === 'PENDING');
      this.commandePending = pendingData;
      this.cards[0].value = this.commandePending.length;

      // Filtrer les données pour ne garder que les commandes avec le statut "DELIVERED"
      const deliveredData = data.filter((commande: any) => commande.statutCommande.name === 'DELIVERED');
      this.commandes = deliveredData;

      // Obtenir le mois et l'année en cours.
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Filtrer les commandes pour le mois en cours
      const commandesMensuelles = deliveredData.filter((commande: any) => {
        const dateCommande = new Date(commande.dateCommande);
        return dateCommande.getMonth() === currentMonth && dateCommande.getFullYear() === currentYear;
      });

      // Calculer les totaux pour toutes les commandes
      const commandeParCode = data.reduce((acc: any, commande: any) => {
        acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
        acc.montantTotal += commande.montant;
        return acc;
      }, { codes: {}, montantTotal: 0 });

      // Calculer les totaux pour les commandes mensuelles
      const commandeParCodeMensuel = commandesMensuelles.reduce((acc: any, commande: any) => {
        acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
        acc.montantTotal += commande.montant;
        return acc;
      }, { codes: {}, montantTotal: 0 });

      this.venteTotal = deliveredData.length;
      this.commandeTotal = Object.keys(commandeParCode.codes).length;
      this.montantTotal = commandeParCode.montantTotal;

      // Valeurs mensuelles
      this.commandeTotalMensuel = Object.keys(commandeParCodeMensuel.codes).length;
      this.montantTotalMensuel = commandeParCodeMensuel.montantTotal;
      this.cards[3].content = this.montantTotalMensuel + ' Fcfa';

      // Obtenir le mois et l'année du mois précédent
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const commandesMoisPrecedent = deliveredData.filter((commande: any) => {
        const dateCommande = new Date(commande.dateCommande);
        return dateCommande.getMonth() === previousMonth && dateCommande.getFullYear() === previousYear;
      });

      // Calculer le montant total des ventes du mois précédent
      const montantTotalMoisPrecedent = commandesMoisPrecedent.reduce((total: number, commande: any) => total + commande.montant, 0);

      // Calcul de la variation en pourcentage
      if (montantTotalMoisPrecedent > 0) {
        this.pourcentageEvolution = (((this.montantTotalMensuel - montantTotalMoisPrecedent) / montantTotalMoisPrecedent) * 100).toFixed(2);
      } else {
        this.pourcentageEvolution = this.montantTotalMensuel > 0 ? 100 : 0;
      }
      this.cards[3].value = (this.pourcentageEvolution > 0) ? '+' + this.pourcentageEvolution + '%' : this.pourcentageEvolution + '%';
    });
  }

  /**
   * Retrieves the view count for the current month for the user's products.
   */
  getProductViewCount(username) {
    this.productService.getViewsForCurrentMonthOfProduct(username).then(data => {
      this.visitTotal = data;
      this.cards[2].value = this.visitTotal;

    });
  }
}