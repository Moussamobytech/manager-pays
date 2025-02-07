import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, catchError, of, finalize } from 'rxjs';
import { AppSettings } from 'src/app/app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {

  public analytics: any[];
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

  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog, private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private auth: AuthenticationService,
    private commandeService: CommandeService
  ) {
  }
  ngOnInit() {
    this.currentUser = this.auth.currentUser()
    this.getAllPaniers(this.currentUser.username);
  }

  onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {
    if (this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth) {
   //   this.analytics = [...analytics];
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }



  public async getAllPaniers(id:any) {
    this.ngxSpinnerService.show();

    try {
      const data: any = await firstValueFrom(this.commandeService.getAllCommandeByFournisseur(id));

      // Filtrer les commandes livrées
      const deliveredData = data.filter((commande: any) => commande.statutCommande.name === 'DELIVERED');

     // Fonction pour formater la date en "Mois Année" (ex: "Janvier 2024")
const getMonthYear = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    formatted: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    timestamp: date.getTime() // Stocker un timestamp pour le tri
  };
};

// Initialiser groupedByMonth avec un type explicite
const groupedByMonth: Record<string, { value: number; timestamp: number }> = {};

// Regrouper les montants des ventes par mois
deliveredData.forEach((product: any) => {
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


}