import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, catchError, finalize } from 'rxjs';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { ProductService } from 'src/app/services/product.service';
import { CommandeSearchPipe } from 'src/app/theme/pipes/commandeSearche.pipe';
// import { ProductService } from 'src/app/services/product.service';

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

  }
  commandes: any;
  commandePending:any
  commandePendingTotal:any = 0;


  commandeTotal: any = 0;
  venteTotal: any = 0;
  montantTotal: any = 0;
  commandeTotalMensuel: any = 0;
  pourcentageEvolution: any = 0;
  montantTotalMensuel: any = 0;
  visitTotal: any;


  constructor(private auth: AuthenticationService, private productService: ProductService, private ngxSpinnerService: NgxSpinnerService,
    private router: Router, public dialog: MatDialog, private fb: FormBuilder, private snackBar: MatSnackBar,
    private commandeService: CommandeService, private commonService: CommonMessageService) {

  }

  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    this.getProductViewCount(this.currentUser.username);
    //this.username = this.auth.currentUser();
    // this.points = this.currentUser.points

    if (this.currentUser == null || this.currentUser.profiles == null || this.currentUser.profiles == undefined) {
      this.router.navigate(["/sign-in"]);
    }
    this.stats(this.currentUser.username)

    this.form = this.fb.group({
      amount: ['', Validators.required]

    });
    this.getUserById();
    this.getCommandes(this.currentUser.username);
  }

  public add() {
    this.router.navigate(["/account/add-product"])
  }


  currentProfile(roles) {
    // console.log("roles :::::::: ",roles)
    if (!roles) {
      return 'N/A'
    }
    let key = roles.name
    // console.log("key :::::::: ",key)
    let profil = ""
    switch (key) {
      case "ROLE_PARTICULIER":
        profil = "particulier"
        break;
      case "ROLE_BOUTIQUE":
        profil = "Boutique"
        break
      case "ROLE_ADMIN":
        profil = "Administrateur"
        break;
      case "ROLE_USER":
        profil = "Utilisateur"
        break;

      default:
        profil = "N/A"
        break;
    }
    return profil
  }

  public stats(id) {
    this.productService.stats(id).then((data: any) => {
      // console.log(data)
      this.statsNumber.total = data.total
      this.statsNumber.actif = data.actif
      this.statsNumber.inactif = data.inactif
      this.statsNumber.pending = data.pending
      this.statsNumber.contact = data.contact
    })
  }
  onNoClick(): void {
    this.dialog.closeAll();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.popupTemplate, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      this.router.navigate(["/account/dashboard"])

    });
  }

  getUserById() {
    this.auth.info(this.currentUser.username).then((data: any) => {
      // console.log("Username ",data)
      this.username = data;
      this.points = data.points

      //  console.log("Username ",data)


    })
  }
  onRecharge() {
    if (this.form.valid) {
      const amount: number = +this.form.get('amount').value; // Ensure amount is a number
      // console.log('Amount to recharge:', amount); // Debugging line


      this.auth.recharge(amount, this.currentUser.id).subscribe(
        response => {
          // console.log('Recharge successful:', response);
          this.points = response.points

          setTimeout(() => {
            this.dialog.closeAll();
          }, 3000);
          if (amount != null) {
            // console.log("MES POINT ", this.points);

            //   this.router.navigate(["/account/dashboard"])
          }

        },
        error => {
          this.snackBar.open('Une erreur lors de la connexion, merci de réessayer !', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
          console.error('Error during recharge:', error);
        }
      );
    }
  }


  public async getCommandes(id) {
    /// this.ngxSpinnerService.show(); // Assurez-vous d'afficher le spinner avant la requête

    await this.commandeService.getAllCommandeByFournisseur(id).pipe(
      map((commande: any) => {
        return commande;
      }),
      catchError((error: any) => {
        console.error("Erreur lors de la récupération des commandes : ", error);
        this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
        return []; // Retourne une liste vide en cas d'erreur pour éviter les plantages
      }),
      finalize(() => {
        this.ngxSpinnerService.hide(); // Masquez le spinner une fois la requête terminée (succès ou erreur)
      })
    ).subscribe(
      (data: any) => {

          // Filtrer les données pour ne garder que les commandes avec le statut "DELIVERED"
          const pendingData = data.filter((commande: any) => {
            return commande.statutCommande.name === 'PENDING';
          });
          this.commandePending = pendingData
          this.commandePendingTotal = pendingData.length

        // Filtrer les données pour ne garder que les commandes avec le statut "DELIVERED"
        const deliveredData = data.filter((commande: any) => {
          return commande.statutCommande.name === 'DELIVERED';
        });
        this.commandes = deliveredData;

        // Obtenir le mois et l'année en cours
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Mois en cours (0 = Janvier)
        const currentYear = currentDate.getFullYear(); // Année en cours

        // Filtrer les commandes pour le mois en cours
        const commandesMensuelles = deliveredData.filter((commande: any) => {
          const dateCommande = new Date(commande.dateCommande);
          return (
            dateCommande.getMonth() === currentMonth &&
            dateCommande.getFullYear() === currentYear
          );
        });

        // Calculer les totaux pour toutes les commandes
        const commandeParCode = data.reduce(
          (acc: any, commande: any) => {
            acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
            acc.montantTotal += commande.montant;
            return acc;
          },
          { codes: {}, montantTotal: 0 }
        );

        // Calculer les totaux pour les commandes mensuelles
        const commandeParCodeMensuel = commandesMensuelles.reduce(
          (acc: any, commande: any) => {
            acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
            acc.montantTotal += commande.montant;
            return acc;
          },
          { codes: {}, montantTotal: 0 }
        );

        this.venteTotal = deliveredData.length; // Total des commandes
        this.commandeTotal = Object.keys(commandeParCode.codes).length; // Nombre de commandes uniques
        this.montantTotal = commandeParCode.montantTotal; // Montant total des commandes

        // Valeurs mensuelles
        this.commandeTotalMensuel = Object.keys(commandeParCodeMensuel.codes).length; // Nombre de commandes uniques pour le mois en cours
        this.montantTotalMensuel = commandeParCodeMensuel.montantTotal; // Montant total des commandes pour le mois en cours

       
       // Obtenir le mois et l'année du mois précédent
const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

// Filtrer les commandes pour le mois précédent
const commandesMoisPrecedent = deliveredData.filter((commande: any) => {
  const dateCommande = new Date(commande.dateCommande);
  return (
    dateCommande.getMonth() === previousMonth &&
    dateCommande.getFullYear() === previousYear
  );
});

// Calculer le montant total des ventes du mois précédent
const montantTotalMoisPrecedent = commandesMoisPrecedent.reduce(
  (total: number, commande: any) => total + commande.montant,
  0
);

// Calcul de la variation en pourcentage
if (montantTotalMoisPrecedent > 0) {
  this.pourcentageEvolution = (((this.montantTotalMensuel - montantTotalMoisPrecedent) / montantTotalMoisPrecedent) * 100).toFixed(2);
} else {
  this.pourcentageEvolution = this.montantTotalMensuel > 0 ? 100 : 0; // Si le mois précédent était vide, la croissance est de 100%
}

       
        this.ngxSpinnerService.hide();

      }
    );
  }



  getProductViewCount(username){
    this.productService.getViewsForCurrentMonthOfProduct(username).then(data => {
   this.visitTotal = data;          
    })
  }

}
