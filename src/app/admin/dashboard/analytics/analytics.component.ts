import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { firstValueFrom } from 'rxjs';
import { AppSettings } from 'src/app/app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { FormControl } from '@angular/forms';

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

  allData: any[] = [];
  selectedYear = new FormControl(new Date().getFullYear()); // Année actuelle par défaut
  availableYears: any[] = []; // Liste des années disponibles

  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog, private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private auth: AuthenticationService,
    private commandeService: CommandeService
  ) {}

  ngOnInit() {
    this.getAllPaniers();
  }

  onSelect(event) {
    console.log(event);
  }

  ngAfterViewChecked() {
    if (this.previousWidthOfResizedDiv !== this.resizedDiv.nativeElement.clientWidth) {
      this.analytics = [...this.analytics];
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

  public async getAllPaniers() {
    this.ngxSpinnerService.show();

    try {
      const data: any = await firstValueFrom(this.commandeService.getAllPanier());

      // Filtrer les commandes livrées
      this.allData = data.filter((commande: any) => commande.statutCommande.name === 'DELIVERED');

      // Extraire les années uniques des commandes livrées
      this.availableYears = [...new Set(this.allData.map(cmd => new Date(cmd.dateCommande).getFullYear()))]
        .sort((a, b) => b - a); // Trier les années du plus récent au plus ancien

      // Appliquer le filtre pour l'année sélectionnée
      this.filterByYear();

    } catch (error) {
      console.error("Erreur lors de la récupération des commandes :", error);
      this.commonService.errorToast("Une erreur est survenue lors de la récupération des commandes.");
    } finally {
      this.ngxSpinnerService.hide();
    }
  }

  filterByYear() {
    const getMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return {
        formatted: date.toLocaleDateString('fr-FR', { month: 'long', }),
        timestamp: date.getTime(),
        year: date.getFullYear()
      };
    };

    const groupedByMonth: Record<string, { value: number; timestamp: number }> = {};

    this.allData
      .filter(cmd => getMonthYear(cmd.dateCommande).year === this.selectedYear.value)
      .forEach(cmd => {
        const { formatted, timestamp } = getMonthYear(cmd.dateCommande);
        if (!groupedByMonth[formatted]) {
          groupedByMonth[formatted] = { value: 0, timestamp };
        }
        groupedByMonth[formatted].value += cmd.montant;
      });

    const series = Object.entries(groupedByMonth)
      .map(([month, data]) => ({
        name: month.charAt(0).toUpperCase() + month.slice(1),
        value: data.value,
        timestamp: data.timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ name, value }) => ({ name, value }));

    this.analytics = [
      {
        name: 'Évolution des ventes',
        series: series
      }
    ];
  }
}
