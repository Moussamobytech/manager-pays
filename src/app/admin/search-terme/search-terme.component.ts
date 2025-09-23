import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-search-terme',
  templateUrl: './search-terme.component.html',
  styleUrl: './search-terme.component.scss'
})
export class SearchTermeComponent implements OnInit {
  sortedCountries: any[];
  mesMots: any;
  count = 5;
  page = 1;

  constructor(public appService: AppService) {}

  ngOnInit(): void {
    this.getAllTermOfSearch();
  }

  getAllTermOfSearch() {
    this.appService.getAllSearchNotFoundTerme().subscribe(datas => {
      console.log("MES MOTS VAUTS ", JSON.stringify(datas));
      this.mesMots = datas;
    });
  }

  sortCountry(keyWord: string) {
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true;
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedCountries = [...this.mesMots].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    this[ascKey] = !isAscending;
  }

  getSortValue(country: any, keyWord: string): any {
    switch (keyWord) {
      case "termeRecherche":
        return country.termeRecherche?.trim().toLowerCase() || '';
      case "nombreTentatives":
        return country.nombreTentatives || 0;
      case "createdAt":
        return new Date(country.createdAt).getTime() || 0;
      default:
        return '';
    }
  }

  // Bascule l'état du toggle et met à jour si nécessaire
  toggleStatus(id: any, newStatus: boolean) {
    const item = this.mesMots.find((mot: any) => mot.id === id);
    if (item) {
      item.etat = newStatus;
      console.log(`Mise à jour du statut pour l'ID ${id} à ${newStatus}`);
      // Exemple : this.appService.updateSearchTermStatus(id, newStatus).subscribe(...);
    }
  }

  remove(_t35: any) {
    console.log(`Suppression de l'élément : ${_t35}`);
  }

  openPaysDetails(_t35: any) {
    console.log(`Ouverture des détails pour : ${_t35}`);
  }

  openDialog(id: any) {
    console.log(`Ouverture de la boîte de dialogue pour l'ID : ${id}`);
  }

  openRegionDialog(arg0: null) {
    throw new Error('Méthode non implémentée.');
  }
}