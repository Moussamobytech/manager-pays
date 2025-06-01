import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, catchError, of, finalize } from 'rxjs';
import { AppSettings } from 'src/app/app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { firstValueFrom } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {

  public analytics: any[] = [];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = false;
  public xAxisLabel = 'Year';
  public showYAxisLabel = false;
  public yAxisLabel = 'Profit';
  public colorScheme: any = {
    domain: ['#283593', '#039BE5', '#FF5252']
  };
  public autoScale = true;
  public roundDomains = true;
  @ViewChild('resizedDiv') resizedDiv: ElementRef;
  public previousWidthOfResizedDiv: number = 0;
  currentUser: any


  public selectedYear: FormControl = new FormControl(); // Contrôle de formulaire pour l'année
  public availableYears: any = [];
  comm: any = 0;


  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog, private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private auth: AuthenticationService,
    private commandeService: CommandeService
  ) {
  }
  async ngOnInit() {
    this.currentUser = this.auth.currentUser()
  //  this.getAllPaniers(this.currentUser.username);
    this.initializeAvailableYears();
    await this.getAllPaniers(this.currentUser.username);
    const currentYear = new Date().getFullYear();
    this.selectedYear.setValue(currentYear);

  }

  onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {
  //   if (this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth) {
  //  //   this.analytics = [...analytics];
  //   }
    if (this.resizedDiv && this.resizedDiv.nativeElement) {
      this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
    }
    
  }


 // Fonction pour remplir la liste des années disponibles (2020 à l'année actuelle)
 private initializeAvailableYears(): void {
  const currentYear = new Date().getFullYear();
  this.availableYears = [];
  for (let year = 2020; year <= currentYear; year++) {
    this.availableYears.push(year);
  }
}

 // Fonction de filtre basé sur l'année sélectionnée
 public async filterByYear(): Promise<void> {
  const selectedYear = this.selectedYear.value;
  if (selectedYear) {
    await this.getAllPaniers(this.currentUser.username, selectedYear); // Appelle avec l'année sélectionnée
  }
}


public async getAllPaniers(id: any, year: number = new Date().getFullYear()) {
  this.ngxSpinnerService.show();
  this.comm = 0;
  try {
    const data: any = await firstValueFrom(this.commandeService.getAllCommandeByFournisseur(id));
    this.comm = data

    // Filtrer les commandes livrées
    const deliveredData = data.filter((commande: any) => commande.statutCommande.name === 'DELIVERED');

    // Extraire les années uniques des commandes livrées
    this.availableYears = Array.from(new Set(
      deliveredData.map((product: any) => new Date(product.dateCommande).getFullYear())
    )).sort((a:any, b:any) => b - a); // Tri des années de la plus récente à la plus ancienne

    // Récupérer l'année actuelle si aucune année n'est présente dans les données
    if (this.availableYears.length === 0) {
      this.availableYears.push(new Date().getFullYear());
    }

    // Récupérer les données uniquement pour l'année sélectionnée
    const filteredData = deliveredData.filter((product: any) => new Date(product.dateCommande).getFullYear() === year);

    // Fonction pour formater la date en "Mois Année" (ex: "Janvier 2024")
    const getMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return {
        formatted: date.toLocaleDateString('fr-FR', { month: 'long' }),
        timestamp: date.getTime() // Stocker un timestamp pour le tri
      };
    };

    // Initialiser groupedByMonth avec un type explicite
    const groupedByMonth: Record<string, { value: number; timestamp: number }> = {};

    // Regrouper les montants des ventes par mois, mais uniquement pour l'année sélectionnée
    filteredData.forEach((product: any) => {
      const { formatted, timestamp } = getMonthYear(product.dateCommande);
      if (!groupedByMonth[formatted]) {
        groupedByMonth[formatted] = { value: 0, timestamp };
      }
      groupedByMonth[formatted].value += product.montant;
    });

    // Transformer les données pour le graphique et trier par date croissante
    const series = Object.entries(groupedByMonth)
      .map(([month, data]) => ({
        name: month.charAt(0).toUpperCase() + month.slice(1), // Mettre la première lettre en majuscule
        value: data.value,
        timestamp: data.timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp) // Tri des dates du plus ancien au plus récent
      .map(({ name, value }) => ({ name, value })); // Supprimer timestamp après tri

    this.analytics = [
      {
        name: 'Évolution des ventes',
        series: series
      }
    ];

  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error);
    this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
  } finally {
    this.ngxSpinnerService.hide();
  }
}
/*
  public async getAllPaniers(id: any) {
    this.ngxSpinnerService.show();

    try {
      const data: any = await firstValueFrom(this.commandeService.getAllCommandeByFournisseur(id));

      // Filtrer les commandes livrées
      const deliveredData = data.filter((commande: any) => commande.statutCommande.name === 'DELIVERED');

      // Récupérer l'année actuelle
      const currentYear = new Date().getFullYear();

      // Fonction pour formater la date en "Mois Année" (ex: "Janvier 2024")
      const getMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
          formatted: date.toLocaleDateString('fr-FR', { month: 'long' }),
          timestamp: date.getTime() // Stocker un timestamp pour le tri
        };
      };

      // Initialiser groupedByMonth avec un type explicite
      const groupedByMonth: Record<string, { value: number; timestamp: number }> = {};

      // Regrouper les montants des ventes par mois, mais uniquement pour l'année en cours
      deliveredData.forEach((product: any) => {
        const { formatted, timestamp } = getMonthYear(product.dateCommande);
        const productYear = new Date(product.dateCommande).getFullYear(); // Extraire l'année de la commande

        // Vérifier si l'année de la commande correspond à l'année en cours
        if (productYear === currentYear) {
          if (!groupedByMonth[formatted]) {
            groupedByMonth[formatted] = { value: 0, timestamp };
          }
          groupedByMonth[formatted].value += product.montant;
        }
      });

      // Transformer les données pour le graphique et trier par date croissante
      const series = Object.entries(groupedByMonth)
        .map(([month, data]) => ({
          name: month.charAt(0).toUpperCase() + month.slice(1), // Mettre la première lettre en majuscule
          value: data.value,
          timestamp: data.timestamp
        }))
        .sort((a, b) => a.timestamp - b.timestamp) // Tri des dates du plus ancien au plus récent
        .map(({ name, value }) => ({ name, value })); // Supprimer timestamp après tri

      this.analytics = [
        {
          name: 'Évolution des ventes',
          series: series
        }
      ];

    } catch (error) {
      console.error("Erreur lors de la récupération des commandes :", error);
      this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
    } finally {
      this.ngxSpinnerService.hide();
    }
  }
  */


}
