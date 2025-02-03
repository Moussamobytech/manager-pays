import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, catchError, of, finalize } from 'rxjs';
import { AppSettings } from 'src/app/app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-c-analytics',
  templateUrl: './c-analytics.component.html',
  styleUrl: './c-analytics.component.scss'
})
export class CAnalyticsComponent implements OnInit {


  public analytics: any[];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = true;
  public showLegend = false;
  public showXAxisLabel = false;
  public xAxisLabel = 'Year';
  public showYAxisLabel = false;
  public yAxisLabel = 'Profit';
  public colorScheme: any = {
    domain: ['#283593', '#039BE5', '#FF5252']
  };
  public roundDomains = true;
  public autoScale = true;
  @ViewChild('resizedDiv') resizedDiv: ElementRef;


  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog, private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private commandeService: CommandeService
  ) {
  }

  ngOnInit(): void {
    this.getCommandes()
  }

  onSelect(event) {
    console.log(event);
  }




  public async getCommandes() {
    this.ngxSpinnerService.show(); // Afficher le spinner avant la requête
    try {
      const data: any = await firstValueFrom(this.commandeService.getAllCommande());

      // Fonction pour formater la date en "YYYY-MM"
      const getMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      };

      // Regrouper les montants des ventes par mois
      const groupedByMonth = data.reduce((acc, product) => {
        const month = getMonthYear(product.dateCommande);
        acc[month] = (acc[month] || 0) + product.montant;
        return acc;
      }, {} as Record<string, number>);

      // Transformer les données pour le graphique
      const series = Object.entries(groupedByMonth)
        .map(([month, montant]) => ({
          name: month,
          value: montant
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Tri des dates du plus ancien au plus récent

      this.analytics = [
        {
          name: 'Évolution des commandes',
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
