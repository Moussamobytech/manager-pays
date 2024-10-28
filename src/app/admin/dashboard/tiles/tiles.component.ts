import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { profile } from 'console';
import { Product } from 'src/app/models/product.models';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss']
})
export class TilesComponent implements OnInit {
  // products : any = {
  //   total : 0,
  //   actif : 0,
  //   inactif : 0,
  //   pending : 0
  // }
 public totalActif: number = 0;
 public totalInActif: number = 0;
 public totalPending : number =0;
 public products : Product [] =[];
  public best :any;
  public topRate : any;
  public users :User[] = [];
  public userParticulier : any;
  public userBoutique : any;
  public vendeurInActif :any;

  public totalViews : any;
  public currentDateDay : any;

  public currentMonth : any;
  public totalViewsMonth : any;


  public currentYear : any;
  public totalViewsYear :any;

  constructor(private auth : AuthenticationService,private productService : ProductService, private router: Router) { }

  ngOnInit(): void {
    this.bestProduct();
    this.getAllProduct();
    this.topRateProduct();
    this.getUsers();

    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear();
    this.currentDateDay = this.formatDate(currentDate);
    this.currentMonth = this.formatDate(currentDate, 'year-month');

    // this.productService.getTotalProductViewsByDate(this.currentDateDay).subscribe(
    //   total => {
    //     this.totalViews = total;
    //     console.log("Total ",this.totalViews )
    //   },
    //   error => {
    //     console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
    //   }
    // );

    this.productService.getTotalProductViewsDate().subscribe(
      total => {
        this.totalViews = total;
        console.log("Total ",this.totalViews )
      },
      error => {
        console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
      }
    );


    // this.productService.getTotalViewsByMonth(this.currentMonth).subscribe(
    //   total => {
    //     this.totalViewsMonth = total;
    //     console.log("Total month",this.totalViewsMonth )
    //   },
    //   error => {
    //     console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
    //   }
    // );
   this.productService.getTotalViewsMonth().subscribe(
      total => {
        this.totalViewsMonth = total;
        console.log("Total month",this.totalViewsMonth )
      },
      error => {
        console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
      }
    );
    const DateYear = 2024;

  //   this.productService.getTotalViewsByYear(this.currentYear).subscribe(
  //     total => {
  //       this.totalViewsYear = total;
  //       console.log("Total year",this.totalViewsYear )
  //     },
  //     error => {
  //       console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
  //     }
  //   );
  // }
  this.productService.getTotalViewsYear().subscribe(
    total => {
      this.totalViewsYear = total;
      console.log("Total year",this.totalViewsYear )
    },
    error => {
      console.log('Une erreur s\'est produite lors de la récupération de la somme des vues :', error);
    }
  );
}

  public bestProduct(){
    this.productService.getProductByBest().then((data:any) =>{
      console.log(data)
      this.best = data;
    })
  }
  public topRateProduct(){
    this.productService.getProductByTop().then((data:any) =>{
      console.log(":::::::",data)
      this.topRate = data;

      console.log("Liste des produits visités :", this.topRate);
    //   this.topRate.forEach((product: any) => {
    //   // console.log(`${index}:`, product.etat);
    //   console.log("Visites mensuelles:", product.monthlyVisits);
    //   console.log("Visites journalières:", product.dailyVisits);
    //   console.log("Visites annuelles:", product.yearlyVisits);
    // });
    })
  }


  public getAllProduct(){
    this.productService.getAllProducts().then((data: any) =>{
      this.products = data;
      console.log("::::::::::::::::::;;;; total", data);

      this.totalInActif = this.products.filter((product: any) => product.etat == 'PENDING').length;

      console.log(`Total produits inactifs: ${this.totalInActif}`);

      // this.products.etat = data.etat
      console.log("::::::::::::::::::;;;; actif actif actif ", this.products);
    // Afficher l'état de chaque produit dans la console
    // this.products.forEach(product => {
    //   console.log("Etat du produit:", product.etat);
    //   console.log("Etat du produit e:", product.etat.length);
    // });
      // this.products.inactif = data.inactif
      // this.products.pending = data.pending

    //  // Compter le nombre de produits actifs
     this.totalActif = this.products.filter(product => product.etat === 'ACTIF').length;
     console.log(":::::::::: total  ", this.totalActif);

     // Compter le nombre de produits inactifs
    //  this.totalInActif = this.products.filter(product => product.etat === 'inactif').length;
    //  console.log(":::::::::: totalInActif  ", this.totalInActif);

    //  // Compter le nombre de produits en attente
    //  this.totalPending = this.products.filter(product => product.etat === 'pending').length;
    //  console.log(":::::::::: total pending ", this.totalPending);
    })
  }


  public getUsers(){
    this.auth.list().then((data: any) =>{
      this.users =data;
      console.log("::::::::::::::::::;;;; users", data);
      this.userBoutique = data.filter((user: User) => user.profiles?.some(profile => profile.name === 'ROLE_BOUTIQUE'));
      console.log('Utilisateurs avec le rôle ROLE_BOUTIQUE :', this.userBoutique);

      this.userParticulier = data.filter((user: User) => user.profiles?.some(profile => profile.name === 'ROLE_PARTICULIER'));
      console.log('Utilisateurs avec le rôle ROLE_PARTICULIER :', this.userParticulier);


      this.vendeurInActif = data.filter((user: User) =>
            !user.enabled &&
            user.profiles?.some(profile => profile.name === 'ROLE_BOUTIQUE' || profile.name === 'ROLE_PARTICULIER')
        ).length;

        console.log(`Total utilisateurs inactifs (boutique + particulier): ${this.vendeurInActif}`);

    //   this.totalInActif = this.userBoutique.filter((user: User) => !user.enabled).length;

    //   console.log(`Total vendeurs inactifs: ${this.totalInActif}`);
    //   this.userBoutique.forEach((user: User) => {
    //     const status = user.enabled ? 'Actif' : 'Inactif';
    //     console.log(`User: ${user.username}, Status: ${status}`);
    // });
    });
  }


    formatDate(date: Date, format: 'year-month' | 'full' = 'full'): string {
      const year = date.getFullYear();
      const month = this.padZero(date.getMonth() + 1);

      if (format === 'year-month') {
        return `${year}-${month}`;
      } else {
        const day = this.padZero(date.getDate());
        return `${year}-${month}-${day}`;
      }
    }

    // Fonction pour ajouter un zéro devant les chiffres < 10
    padZero(num: number): string {
      return num < 10 ? '0' + num : '' + num;
    }



}
