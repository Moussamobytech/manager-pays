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

      // Fonction pour formater la date en "YYYY-MM"
      const getMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      };

      // Regrouper les montants des ventes par mois
      const groupedByMonth = deliveredData.reduce((acc, product) => {
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