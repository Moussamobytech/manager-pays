import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Vendor {
  id: number;
  firstName: string;
  lastName: string;
  shopName: string;
  city: string;
  address: string;
  phone: string;
  country: string;
}

@Injectable({ providedIn: 'root' })
export class VendorsService {
  private vendorsSubject = new BehaviorSubject<Vendor[]>([]);

  getVendors(): Observable<Vendor[]> {
    return this.vendorsSubject.asObservable();
  }

  getVendorsValue(): Vendor[] {
    return this.vendorsSubject.getValue();
  }

  setInitialVendorsIfEmpty(list: Vendor[]): void {
    if (this.vendorsSubject.getValue().length === 0) {
      this.vendorsSubject.next(list);
    }
  }

  addVendor(partial: Omit<Vendor, 'id'>): Vendor {
    const current = this.vendorsSubject.getValue();
    const nextId = current.length ? Math.max(...current.map(v => v.id)) + 1 : 1;
    const newVendor: Vendor = { id: nextId, ...partial };
    this.vendorsSubject.next([newVendor, ...current]);
    return newVendor;
  }

  updateVendor(id: number, partial: Partial<Omit<Vendor, 'id'>>): Vendor | null {
    const current = this.vendorsSubject.getValue();
    const idx = current.findIndex(v => v.id === id);
    if (idx < 0) return null;
    const updated: Vendor = { ...current[idx], ...partial };
    const next = [...current];
    next[idx] = updated;
    this.vendorsSubject.next(next);
    return updated;
  }
}