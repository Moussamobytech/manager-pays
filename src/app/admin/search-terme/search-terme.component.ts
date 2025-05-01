import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-search-terme',
  templateUrl: './search-terme.component.html',
  styleUrl: './search-terme.component.scss'
})
export class SearchTermeComponent implements OnInit{
  sortedCountries: any[];
openPaysDetails(_t35: any) {
throw new Error('Method not implemented.');
}
setStatus(arg0: any,$event: MatSlideToggleChange) {
throw new Error('Method not implemented.');
}
remove(_t35: any) {
throw new Error('Method not implemented.');
}


  mesMots:any
  count:5
  page = 1
constructor(  public appService : AppService){

}

  ngOnInit(): void {
    this.getAllTermOfSearch();
    //throw new Error('Method not implemented.');
  }

  getAllTermOfSearch(){
    this.appService.getAllSearchNotFoundTerme().subscribe(datas =>{
      console.log("MES MOTS VAUTS ",JSON.stringify(datas));
      this.mesMots = datas;
    })
  }
  sortCountry(keyWord: string) {

    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true; // Initialize to ascending on the first sort
    }

    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedCountries = [...this.mesMots].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === "string" && typeof valueB === "string") {
        // This sorting way allows us to account every french characters even accentuated ones
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    // Toggle the direction for the next sort dynamically
    this[ascKey] = !isAscending;
  }
  // function to get the sortable value based on 'keyWord'
  getSortValue(country: any, keyWord: string): any {

    switch (keyWord) {
      case "termeRecherche":
        return country.termeRecherche?.trim().toLowerCase() || '';
      case "nombreTentatives":
        return country.nombreTentatives.toLowerCase() || '';
      case "createdAt":
        return new Date(country.createdAt).getTime() || 0;
      default:
        return '';
    }
  }
openRegionDialog(arg0: null) {
throw new Error('Method not implemented.');
}
openDialog(arg0: null) {
throw new Error('Method not implemented.');
}
}
