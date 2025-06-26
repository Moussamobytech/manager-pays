import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order.models';
import { User } from 'src/app/models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  user: User;
  unchangedOrders: Order[] = [];
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  todayOrders: Order[] = [];
  weekOrders: Order[] = [];
  monthOrders: Order[] = [];
  olderOrders: Order[] = [];
  expandedOrderIds: string[] = [];

  searchTerm: string = '';
  selectedStatusFilter: string = '';
  selectedTimeFilter: string = 'tout';

  pageSize = 6;
  loadedPageCount: number = 6;
  hasMoreOrders: boolean = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private commandeService: CommandeService,
    private cm: CommonService
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.getAllCommande();
    } else {
      this.router.navigate(['/']);
    }
  }

  getAllCommande() {
    this.commandeService.getAllCommandeByUsername(this.user.username).subscribe(
      orders => {
        this.unchangedOrders = [...orders.filter(order => order.dateCommande
          <= new Date().toISOString() && order.statutCommande?.name !== "VALIDE")];
        this.applyFilters();
      },
      error => {
        this.cm.openFailureSnackBar('Une erreur lors de la récupération des commandes, merci de réessayer !')
        console.error('Error fetching orders:', error);
      }
    );
  }

  phoneCall(phoneNumber: string): void {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      this.cm.openFailureSnackBar('Numéro de téléphone invalide.');
      return;
    }

    const telUrl = `tel:${phoneNumber}`;
    window.open(telUrl, '_self');
  }

  loadMoreOrders() {
    this.loadedPageCount += this.pageSize;
    this.displayPaginatedOrders();
  }

  displayPaginatedOrders() {
    this.allOrders = this.filteredOrders.slice(0, this.loadedPageCount);
    this.hasMoreOrders = this.filteredOrders.length > this.loadedPageCount;
    this.groupOrdersByDate();
  }

  filterOrders() {
    this.loadedPageCount = this.pageSize; // Reset pagination when applying new search
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.selectedStatusFilter = this.selectedStatusFilter === status ? '' : status;
    this.loadedPageCount = this.pageSize; // Reset pagination when changing filter
    this.applyFilters();
  }

  filterByTime() {
    this.loadedPageCount = this.pageSize; // Reset pagination when changing time filter
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.unchangedOrders];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order =>
        (order.produitNom && order.produitNom.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (this.selectedStatusFilter) {
      filtered = filtered.filter(order => {
        const status = order.statutCommande?.name;
        if (this.selectedStatusFilter === 'en-attente')
          return status === 'PENDING';
        else if (this.selectedStatusFilter === 'livre')
          return status === 'DELIVERED';
        else if (this.selectedStatusFilter === 'annule')
          return status === 'CANCEL';
        return true;
      });
    }

    // Apply time filter
    if (this.selectedTimeFilter !== 'tout') {
      const now = new Date();

      if (this.selectedTimeFilter === 'aujourdhui') {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.dateCommande);
          return this.isSameDay(orderDate, now);
        });
      } else if (this.selectedTimeFilter === '7-jours') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.dateCommande);
          return orderDate >= sevenDaysAgo;
        });
      } else if (this.selectedTimeFilter === '1-mois') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.dateCommande);
          return orderDate >= oneMonthAgo;
        });
        // console.log("Filtered orders for 1 month:", filtered);
      }
    }

    // Sort orders by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateCommande).getTime();
      const dateB = new Date(b.dateCommande).getTime();
      return dateB - dateA;
    });

    this.filteredOrders = filtered;
    // console.log("Filtered orders:", this.filteredOrders);
    this.displayPaginatedOrders();
    this.groupOrdersByDate();
  }

  groupOrdersByDate() {
    // console.log("allorders", this.allOrders);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate start of week (Monday)
    const weekStart = new Date(today);
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1; // Adjust for week starting on Monday (0=Monday)
    weekStart.setDate(today.getDate() - diffToMonday);

    // Calculate start of month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    this.todayOrders = this.allOrders.filter(order => {
      const orderDate = new Date(order.dateCommande);
      return this.isSameDay(orderDate, now);
    });

    this.weekOrders = this.allOrders.filter(order => {
      const orderDate = new Date(order.dateCommande);
      return !this.isSameDay(orderDate, now) &&
        orderDate >= weekStart &&
        orderDate < today;
    });

    this.monthOrders = this.allOrders.filter(order => {
      const orderDate = new Date(order.dateCommande);
      return !this.isSameDay(orderDate, now) &&
        !(orderDate >= weekStart && orderDate < today) &&
        orderDate >= monthStart &&
        orderDate < today;
    });

    this.olderOrders = this.allOrders.filter(order => {
      const orderDate = new Date(order.dateCommande);
      //  console.log("Order Date",orderDate);
      //console.log("Month Start",monthStart);
      // console.log("Order Date < Month Start",orderDate < monthStart);
      return orderDate < monthStart;
    });

    // console.log("Loaded Page Count",this.loadedPageCount);
    //console.log("Today Orders",this.todayOrders);
    // console.log("Week Orders",this.weekOrders);
    //console.log("Month Orders",this.monthOrders);
    // console.log("Older Orders",this.olderOrders);
    //console.log("filtered Orders",this.filteredOrders);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  toggleOrderDetails(orderId: string) {
    if (this.expandedOrderIds.includes(orderId)) {
      this.expandedOrderIds = this.expandedOrderIds.filter(id => id !== orderId);
    } else {
      this.expandedOrderIds.push(orderId);
    }
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderIds.includes(orderId);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'DELIVERED':
        return 'Livré';
      case 'CANCEL':
        return 'Annulé';
      default:
        return status || 'Inconnu';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'waiting';
      case 'DELIVERED':
        return 'delivered';
      case 'CANCEL':
        return 'cancelled';
      default:
        return '';
    }
  }

  getOrderCountByStatus(status: string): number {
    if (!this.unchangedOrders || this.unchangedOrders.length === 0) {
      return 0;
    }

    if (status === 'en-attente') {
      return this.unchangedOrders.filter(order =>
        order.statutCommande?.name === 'PENDING'
      ).length;
    } else if (status === 'livre') {
      return this.unchangedOrders.filter(order =>
        order.statutCommande?.name === 'DELIVERED'
      ).length;
    } else if (status === 'annule') {
      return this.unchangedOrders.filter(order =>
        order.statutCommande?.name === 'CANCEL'
      ).length;
    } else if (status === 'tout') {
      return this.unchangedOrders.length;
    }
    return 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}