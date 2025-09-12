import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';

interface Order {
  id: string;
  orderDate: Date;
  clientName: string;
  clientId: string;
  city: string;
  status: string;
  vendor: string;
  vendorPhone?: string;
}

@Component({
  selector: 'app-commande-list',
  templateUrl: './commande-list.component.html',
  styleUrls: ['./commande-list.component.scss'],
})
export class CommandeListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'orderDate', 'clientName', 'clientId', 'city', 'status', 'vendor', 'vendorPhone'];
  dataSource = new MatTableDataSource<Order>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filtres
  statusFilter = new FormControl('');
  cityFilter = new FormControl('');
  dateFilter = new FormControl('');
  statusOptions: string[] = ['Tous', 'En attente', 'Livrée', 'Annulée'];
  dateOptions: any[] = [
    { value: 'today', label: "Aujourd'hui" },
    { value: '7days', label: '7 derniers jours' },
    { value: 'month', label: 'Ce mois' },
    { value: '2months', label: '2 derniers mois' },
    { value: '3months', label: '3 derniers mois' },
    { value: '6months', label: '6 derniers mois' },
    { value: '12months', label: '12 derniers mois' }
  ];

  cities: string[] = [];
  allOrders: Order[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Génération de données fictives
    this.allOrders = this.generateMockOrders();
    this.dataSource.data = [...this.allOrders];
    // Définir une recherche insensible à la casse, aux accents et à la ponctuation
    this.dataSource.filterPredicate = (data: Order, filter: string) => {
      const normalizedFilter = this.normalizeForSearch(filter || '');
      if (!normalizedFilter) return true;
      const orderDateStr = new Date(data.orderDate).toLocaleDateString();
      const statusText = this.getStatusText(data.status);
      const searchable = [
        data.id,
        orderDateStr,
        data.clientName,
        data.clientId,
        data.city,
        statusText,
        data.vendor,
        data.vendorPhone
      ]
        .filter(Boolean)
        .map(v => this.normalizeForSearch(v))
        .join(' ');
      return searchable.includes(normalizedFilter);
    };
    this.cities = [...new Set(this.allOrders.map(order => order.city))].sort();
    this.statusFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    this.cityFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    this.dateFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Pré-remplir le filtre statut via query params (status=pending|delivered|cancelled)
    this.route.queryParamMap.subscribe(params => {
      const statusParam = (params.get('status') || '').toLowerCase();
      const mapToLabel: any = { pending: 'En attente', delivered: 'Livrée', cancelled: 'Annulée' };
      if (mapToLabel[statusParam]) {
        this.statusFilter.setValue(mapToLabel[statusParam], { emitEvent: false });
        this.applyFilters();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, header) => {
      if (header === 'orderDate') return new Date(data.orderDate).getTime();
      return data[header as keyof Order] as string;
    };
  }
  // Normalise: minuscules, sans accents, sans tirets/virgules/ponctuation superflus
  private normalizeForSearch(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  applySearchFilter(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.normalizeForSearch(raw);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters() {
    let filteredData = [...this.allOrders];
    // Filtre par statut
    const status = this.statusFilter.value;
    if (status && status !== 'Tous') {
      filteredData = filteredData.filter(order =>
        this.getStatusText(order.status) === status
      );
    }
    // Filtre par ville
    const city = this.cityFilter.value;
    if (city) {
      filteredData = filteredData.filter(order =>
        order.city === city
      );
    }
    // Filtre par date
    const period = this.dateFilter.value;
    if (period) {
      const today = new Date();
      let startDate = new Date();

      switch(period) {
        case 'today':
          startDate.setHours(0,0,0,0);
          break;
        case '7days':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case '2months':
          startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          break;
        case '3months':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          break;
        case '6months':
          startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
          break;
        case '12months':
          startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1);
          break;
      }
      filteredData = filteredData.filter(order =>
        new Date(order.orderDate) >= startDate
      );
    }
    this.dataSource.data = filteredData;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusText(statusCode: string): string {
    switch(statusCode) {
      case 'pending': return 'En attente';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return statusCode;
    }
  }

  generateMockOrders(): Order[] {
    const cities = [
      'Lagos','Cairo','Kinshasa','Johannesburg','Nairobi','Addis Ababa','Casablanca','Abidjan','Accra','Dakar',
      'Algiers','Tunis','Tripoli','Khartoum','Luanda','Dar es Salaam','Kampala','Kigali','Tangier','Marrakech',
      'Fes','Rabat','Douala','Yaoundé','Libreville','Bamako','Ouagadougou','Niamey','Cotonou','Lomé',
      'Monrovia','Freetown','Conakry','Banjul','Nouakchott','Antananarivo','Maputo','Harare','Lusaka','Gaborone',
      'Windhoek','Port Louis','Victoria','Djibouti','Mogadishu','Asmara','Brazzaville','Pointe-Noire','Malabo','Sao Tomé',
      'Praia','Bujumbura','Lilongwe','Blantyre','Kano','Ibadan','Port Harcourt','Benin City','Kumasi','Sekondi-Takoradi'
    ];
    const statuses = ['pending', 'delivered', 'cancelled'];
    const vendors = ['Vendeur A', 'Vendeur B', 'Vendeur C', 'Vendeur D', 'Vendeur E'];
    const clients = ['Client A', 'Client B', 'Client C', 'Client D', 'Client E'];
    const orders: Order[] = [];
    const today = new Date();
    for (let i = 1; i <= 50; i++) {
      const randomDays = Math.floor(Math.random() * 365);
      const orderDate = new Date();
      orderDate.setDate(today.getDate() - randomDays);
      orders.push({
        id: `CMD-${1000 + i}`,
        orderDate,
        clientName: clients[Math.floor(Math.random() * clients.length)],
        clientId: `+223 ${60000000 + i}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        vendorPhone: `+223 ${70000000 + i}`
      });
    }
    return orders.sort((a, b) =>
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }
}