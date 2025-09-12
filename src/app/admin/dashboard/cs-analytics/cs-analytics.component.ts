import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Color, ScaleType } from '@swimlane/ngx-charts';  // Import pour typer colorScheme

@Component({
  selector: 'app-cs-analytics',
  templateUrl: './cs-analytics.component.html',
  styleUrls: ['./cs-analytics.component.scss']
})
export class CSAnalyticsComponent implements OnInit {
  selectedYear = new FormControl(new Date().getFullYear());
  availableYears: number[] = [2022, 2023, 2024, 2025];

  analytics: any[] = [
    {
      name: 'Ventes',
      series: [
        { name: 'Jan', value: 120000 },
        { name: 'Fév', value: 90000 },
        { name: 'Mar', value: 150000 },
        { name: 'Avr', value: 70000 },
        { name: 'Mai', value: 180000 },
        { name: 'Juin', value: 130000 },
        { name: 'Juil', value: 100000 },
        { name: 'Août', value: 160000 },
        { name: 'Sept', value: 200000 },
        { name: 'Oct', value: 175000 },
        { name: 'Nov', value: 190000 },
        { name: 'Déc', value: 210000 }
      ]
    }
  ];

  // Correction : colorScheme doit être un objet Color complet
  colorScheme: Color = {
    name: 'custom', 
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#283593']
  };

  ngOnInit(): void {
  }

  filterByYear() {
    const year = this.selectedYear.value as number;
    console.log('Filtrage par année :', year);
    if (year === 2023) {
      this.analytics = [
        {
          name: 'Ventes',
          series: this.analytics[0].series.map((item: any) => ({
            ...item,
            value: item.value * 0.9 
          }))
        }
      ];
    } else if (year === 2024) {
      // Exemple : augmenter de 20% pour 2024
      this.analytics = [
        {
          name: 'Ventes',
          series: this.analytics[0].series.map((item: any) => ({
            ...item,
            value: item.value * 1.2  // Simulation
          }))
        }
      ];
    } else {
    }
    
    // Le graphique se mettra à jour automatiquement grâce au binding Angular
  }

  onSelect(event: any) {
    console.log('Point sélectionné :', event);
  }
}