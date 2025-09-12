import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppSettings } from 'src/app/app.settings';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { FormControl } from '@angular/forms';
import { Color, ScaleType } from '@swimlane/ngx-charts';  // Import pour typer colorScheme

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit, AfterViewChecked {

  public analytics: any[];
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = true;  // Activé pour matcher cs-analytics (affiche la légende si plusieurs séries)
  public showXAxisLabel = false;
  public xAxisLabel = 'Mois';
  public showYAxisLabel = false;
  public yAxisLabel = 'Montant (FCFA)';
  // colorScheme corrigé (comme avant)
  public colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#283593', '#039BE5', '#FF5252']  // Couleurs pour la série (une seule ici)
  };
  public autoScale = true;
  public roundDomains = true;

  @ViewChild('resizedDiv') resizedDiv: ElementRef;
  public previousWidthOfResizedDiv: number = 0;

  allData: any[] = [];
  selectedYear = new FormControl(new Date().getFullYear()); // Année actuelle (2025 par défaut, mais mock a 2023-2024)
  availableYears: number[] = [];  // Typé comme number[]

  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog,
    private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private auth: AuthenticationService,
    private commandeService: CommandeService
  ) {}

  ngOnInit() {
    this.loadLocalData(); // Charge les données locales mock
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

  // Données locales mock enrichies (ajout de plus d'entrées pour tester tous les mois)
  private loadLocalData() {
    this.allData = [
      // 2024 : jan, fév (x2), mar, mai, août, déc
      { id: 1, montant: 120, dateCommande: '2024-01-15', statutCommande: { name: 'DELIVERED' } },
      { id: 2, montant: 300, dateCommande: '2024-02-10', statutCommande: { name: 'DELIVERED' } },
      { id: 3, montant: 150, dateCommande: '2024-02-25', statutCommande: { name: 'DELIVERED' } },
      { id: 4, montant: 500, dateCommande: '2024-03-05', statutCommande: { name: 'DELIVERED' } },
      { id: 8, montant: 250, dateCommande: '2024-05-20', statutCommande: { name: 'DELIVERED' } },
      { id: 9, montant: 180, dateCommande: '2024-08-12', statutCommande: { name: 'DELIVERED' } },
      { id: 10, montant: 220, dateCommande: '2024-12-01', statutCommande: { name: 'DELIVERED' } },
      // 2023 : avr, juin, sept, oct, nov
      { id: 5, montant: 200, dateCommande: '2023-04-18', statutCommande: { name: 'DELIVERED' } },
      { id: 6, montant: 350, dateCommande: '2023-06-12', statutCommande: { name: 'DELIVERED' } },
      { id: 7, montant: 400, dateCommande: '2023-09-20', statutCommande: { name: 'DELIVERED' } },
      { id: 11, montant: 280, dateCommande: '2023-10-15', statutCommande: { name: 'DELIVERED' } },
      { id: 12, montant: 320, dateCommande: '2023-11-25', statutCommande: { name: 'DELIVERED' } }
    ];

    // Extraire les années uniques (triées décroissantes)
    this.availableYears = [...new Set(this.allData.map(cmd => new Date(cmd.dateCommande).getFullYear()))]
      .sort((a, b) => b - a);

    // Appliquer filtre initial (affiche tous les mois pour l'année courante)
    this.filterByYear();
  }

  filterByYear() {
    const year = this.selectedYear.value as number;
    console.log('Filtrage par année :', year);

    const getMonthYear = (dateStr: string) => {
      const date = new Date(dateStr);
      return {
        formatted: date.toLocaleDateString('fr-FR', { month: 'long' }),  // Nom du mois en français (minuscule)
        timestamp: date.getTime(),
        year: date.getFullYear()
      };
    };

    // Liste des 12 mois en français (minuscules pour matching)
    const moisFrancais = [
      'jan', 'fév', 'mars', 'avr', 'mai', 'juin',
      'juil', 'août', 'sep', 'oct', 'nov', 'déc'
    ];

    // Initialiser TOUS les mois à 0 pour l'année (force l'affichage complet de la ligne)
    const groupedByMonth: Record<string, { value: number; timestamp: number }> = {};
    moisFrancais.forEach((mois, index) => {
      const dateMois = new Date(year, index, 1);  // Premier jour du mois pour le timestamp
      groupedByMonth[mois] = { value: 0, timestamp: dateMois.getTime() };
    });

    // Filtrer et agréger les données réelles (seulement DELIVERED et pour l'année)
    this.allData
      .filter(cmd => cmd.statutCommande.name === 'DELIVERED')
      .filter(cmd => getMonthYear(cmd.dateCommande).year === year)
      .forEach(cmd => {
        const { formatted, timestamp } = getMonthYear(cmd.dateCommande);
        const moisNormalise = formatted.toLowerCase();  // Minuscule pour matcher
        if (groupedByMonth[moisNormalise]) {
          groupedByMonth[moisNormalise].value += cmd.montant;  // Ajoute au total du mois
        }
      });

    // Simulation optionnelle pour 2023 : multiplier par 1.5 (pour différencier ; retirez si non voulu)
    if (year === 2023) {
      Object.values(groupedByMonth).forEach((data: any) => {
        data.value *= 1.5;
      });
    }

    // Créer la série triée par timestamp (ordre chrono : ligne continue de jan à déc)
    const series = Object.entries(groupedByMonth)
      .map(([month, data]) => ({
        name: month.charAt(0).toUpperCase() + month.slice(1),  // Capitaliser : "Janvier"
        value: data.value,
        timestamp: data.timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp)  // Tri par date (essentiel pour la ligne continue)
      .map(({ name, value }) => ({ name, value }));  // Format ngx-charts

    // Mise à jour des analytics (une série unique)
    this.analytics = [
      {
        name: 'Évolution des commandes',
        series: series  // Maintenant 12 points : ligne complète !
      }
    ];

    console.log('Données series pour le graphique :', series);  // Pour debug : vérifiez en console
  }
}