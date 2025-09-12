import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { VendorsService, Vendor } from '../vendors.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['firstName','lastName','shopName','city','country','address','phone','actions'];
  allVendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];

  availableCountries: string[] = [];
  availableCities: string[] = [];

  selectedCountry: string = '';
  selectedCity: string = '';
  search: string = '';

  itemsPerPage = 10;
  currentPage = 1;
  sub!: Subscription;

  constructor(private vendorsService: VendorsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const initial = this.generateMockVendors();
    this.vendorsService.setInitialVendorsIfEmpty(initial);

    this.sub = this.vendorsService.getVendors().subscribe(list => {
      this.allVendors = list;

      // ✅ Ajouter "Tous les pays" (valeur vide) au début
      const uniqueCountries = Array.from(new Set(this.allVendors.map(v => v.country))).sort();
      this.availableCountries = [''].concat(uniqueCountries);

      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  onCountryChange(country: string) {
    this.selectedCountry = country;
    this.selectedCity = '';

    // ✅ si aucun pays → villes globales
    const citiesFiltered = this.allVendors
      .filter(v => !country || v.country === country)
      .map(v => v.city);

    this.availableCities = [''].concat(Array.from(new Set(citiesFiltered)).sort());

    this.applyFilters();
  }

  applyFilters(searchValue: string = this.search) {
    this.search = searchValue || '';
    const normalized = this.normalize(this.search);

    this.filteredVendors = this.allVendors.filter(v => {
      const matchCountry = !this.selectedCountry || v.country === this.selectedCountry;
      const matchCity = !this.selectedCity || v.city === this.selectedCity;
      const matchSearch = this.normalize(`${v.firstName} ${v.lastName} ${v.shopName}`).includes(normalized);
      return matchCountry && matchCity && matchSearch;
    });

    this.currentPage = 1;
  }

  private normalize(s: any): string {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateMockVendors(): Vendor[] {
    const cities = ['Dakar','Thiès','Saint-Louis','Ziguinchor','Kaolack','Touba','Mbour','Louga','Kolda','Tambacounda','Casablanca','Rabat'];
    const shops = ['Boutique Soleil','Marché Central','CasaShop','MegaStore','TopMarket','Boutique Sahara'];
    const first = ['Ali','Moussa','Aminata','Fatou','Ibrahima','Mariama','Ousmane','Khady'];
    const last = ['Ndiaye','Diop','Sow','Ba','Fall','Cissé','Gueye'];

    const list: Vendor[] = [];
    for (let i=1;i<=24;i++) {
      list.push({
        id: i,
        firstName: first[Math.floor(Math.random()*first.length)],
        lastName: last[Math.floor(Math.random()*last.length)],
        shopName: shops[Math.floor(Math.random()*shops.length)],
        city: cities[Math.floor(Math.random()*cities.length)],
        address: 'Adresse ' + (100+i),
        phone: '+221 77 ' + (100+Math.floor(Math.random()*900)).toString().padStart(3,'0') + ' ' + (100+Math.floor(Math.random()*900)).toString().padStart(3,'0'),
        country: i%3===0 ? 'Maroc' : 'Sénégal'
      });
    }
    return list;
  }
}
