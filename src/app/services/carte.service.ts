import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  // Observable for cart count
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    // Initialize cart count from session storage if available
    const storedCount = sessionStorage.getItem('totalCartCount');
    this.cartCountSubject.next(storedCount ? JSON.parse(storedCount) : 0);
  }

  // Method to update cart count
  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
    sessionStorage.setItem('totalCartCount', JSON.stringify(count));
  }
}
