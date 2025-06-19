// src/app/services/region.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private statesUrl = '../assets/data/countries_states.json'; // Path to your JSON file

  constructor(private http: HttpClient) {}

  getRegionsByCountryCode(countryCode: string): Observable<any[]> {
    return this.http.get<any[]>(this.statesUrl).pipe(
      map(states => states.filter(state => state.name === countryCode))
    );
  }
}
