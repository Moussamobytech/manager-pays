import { orders, products, refunds } from '../dashboard.data';
import { ElementRef, ViewChild, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonMessageService } from 'src/app/services/common-message.service';
import { AppSettings } from 'src/app/app.settings';
import { CommandeService } from 'src/app/services/commande.service';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";

type OrderStatus = 'pending' | 'validated' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-info-cards',
  templateUrl: './info-cards.component.html',
  styleUrls: ['./info-cards.component.scss'],

})
export class InfoCardsComponent implements OnInit {
  public orders: any[];
  public ordersMensuel: any[];
  public products: any[];
  public customers: any[];
  public refunds: any[];
  public colorScheme: any = {
    domain: ['rgba(255,255,255,0.8)']
  };
  public autoScale = true;
  @ViewChild('resizedDiv') resizedDiv: ElementRef;
  public previousWidthOfResizedDiv: number = 0;

  // Commandes & ventes
  totalOrders: any = 0;
  totalMontantOrders: any = 0;
  totalOrdersMensuelles: any;
  totalMontantMensuelles: any;
  montantVenteTotal: any;
  venteTotal: any;
  paniers: any;
  venteTotalMensuel: number;
  montantTotalMensuel: any;
  productsMensuel: { name: string; value: number; }[];

  // Produits
  produitsTotal: number = 0;
  produitsActifs: number = 0;

  // Visites
  visitesMois: number = 0;

  // Données locales mockées Commandes
  private mockCommandes = [
    { codeCommande: 'CMD001', dateCommande: '2025-09-01T10:30:00', montant: 25000, statutCommande: { name: 'PENDING' } },
    { codeCommande: 'CMD002', dateCommande: '2025-09-01T14:20:00', montant: 35000, statutCommande: { name: 'VALIDATED' } },
    { codeCommande: 'CMD003', dateCommande: '2025-09-01T09:15:00', montant: 18000, statutCommande: { name: 'DELIVERED' } },
    { codeCommande: 'CMD004', dateCommande: '2025-08-20T16:45:00', montant: 42000, statutCommande: { name: 'DELIVERED' } },
    { codeCommande: 'CMD005', dateCommande: '2025-09-01T11:30:00', montant: 28000, statutCommande: { name: 'CANCELLED' } }
  ];

  // Données locales mockées Produits
  private mockProduits = [
    { id: 1, nom: 'Produit A', actif: true },
    { id: 2, nom: 'Produit B', actif: true },
    { id: 3, nom: 'Produit C', actif: false },
    { id: 4, nom: 'Produit D', actif: true },
    { id: 5, nom: 'Produit E', actif: true }
  ];

  // Données locales mockées Visites
  private mockVisites = [
    { date: '2025-09-01', nbVisites: 50 },
    { date: '2025-09-02', nbVisites: 120 },
    { date: '2025-09-03', nbVisites: 75 },
    { date: '2025-09-04', nbVisites: 90 }
  ];

  constructor(
    public appSettings: AppSettings,
    public dialog: MatDialog,
    private commonService: CommonMessageService,
    private ngxSpinnerService: NgxSpinnerService,
    private auth: AuthenticationService,
    private commandeService: CommandeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCommandes();
    this.getAllPaniers();
    this.getProduits();
    this.getVisitesMois();
  }

  // ✅ Correction ici : on ajoute "validated"
  goToOrders(statusCode: OrderStatus) {
    this.router.navigate(['/admin/commande'], { queryParams: { status: statusCode } });
  }

  public onSelect(event) {
    console.log(event);
  }

  public addRandomValue(param) {
    switch (param) {
      case 'orders':
        for (let i = 1; i < 30; i++) {
          this.orders[0].series.push({ "name": 1980 + i, "value": Math.ceil(Math.random() * 1000000) });
        }
        return this.orders;
      case 'customers':
        for (let i = 1; i < 15; i++) {
          this.customers[0].series.push({ "name": 2000 + i, "value": Math.ceil(Math.random() * 1000000) });
        }
        return this.customers;
      default:
        return this.orders;
    }
  }

  ngOnDestroy() {
    this.orders[0].series.length = 0;
  }

  ngAfterViewChecked() {
    if (this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth) {
      setTimeout(() => this.orders = [...orders]);
      setTimeout(() => this.products = [...products]);
      setTimeout(() => this.refunds = [...refunds]);
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

  // ------------------------------
  // Commandes & ventes
  // ------------------------------
  public getCommandes() {
    const commandes = this.mockCommandes;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const commandesMensuelles = commandes.filter((commande: any) => {
      const dateCommande = new Date(commande.dateCommande);
      return (
        dateCommande.getMonth() === currentMonth &&
        dateCommande.getFullYear() === currentYear
      );
    });

    const transformedOrders = [
      {
        name: 'Commande',
        series: commandes.map(commande => ({
          name: commande.dateCommande.split('T')[0],
          value: commande.montant
        }))
      }
    ];

    const transformedOrdersMensuel = [
      {
        name: 'Commande',
        series: commandesMensuelles.map(commande => ({
          name: commande.dateCommande.split('T')[0],
          value: commande.montant
        }))
      }
    ];

    const totalMontantMensuelles = commandesMensuelles.reduce((total: number, commande: any) => {
      return total + commande.montant;
    }, 0);

    this.orders = transformedOrders;
    this.ordersMensuel = transformedOrdersMensuel;
    this.totalOrders = this.orders[0].series.length;
    this.totalMontantOrders = this.orders[0].series.reduce((total: number, serie: any) => {
      return total + serie.value;
    }, 0);

    this.totalOrdersMensuelles = commandesMensuelles.length;
    this.totalMontantMensuelles = totalMontantMensuelles;
  }

  public getAllPaniers() {
    const data = this.mockCommandes;

    const deliveredData = data.filter((commande: any) => {
      return commande.statutCommande.name === 'DELIVERED';
    });

    const transformedProducts = deliveredData.map(product => ({
      name: product.dateCommande.split('T')[0],
      value: product.montant
    }));
    this.products = transformedProducts;

    this.paniers = deliveredData;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const commandesMensuelles = deliveredData.filter((commande: any) => {
      const dateCommande = new Date(commande.dateCommande);
      return (
        dateCommande.getMonth() === currentMonth &&
        dateCommande.getFullYear() === currentYear
      );
    });

    const transformedProductsMensuel = commandesMensuelles.map(product => ({
      name: product.dateCommande.split('T')[0],
      value: product.montant
    }));

    this.productsMensuel = transformedProductsMensuel;

    const commandeParCode = deliveredData.reduce(
      (acc: any, commande: any) => {
        acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
        acc.montantTotal += commande.montant;
        return acc;
      },
      { codes: {}, montantTotal: 0 }
    );

    const commandeParCodeMensuel = commandesMensuelles.reduce(
      (acc: any, commande: any) => {
        acc.codes[commande.codeCommande] = (acc.codes[commande.codeCommande] || 0) + 1;
        acc.montantTotal += commande.montant;
        return acc;
      },
      { codes: {}, montantTotal: 0 }
    );

    this.venteTotal = deliveredData.length;
    this.montantVenteTotal = commandeParCode.montantTotal;

    this.venteTotalMensuel = commandesMensuelles.length;
    this.montantTotalMensuel = commandeParCodeMensuel.montantTotal;
  }

  // ------------------------------
  // Produits
  // ------------------------------
  public getProduits() {
    const produits = this.mockProduits;

    this.produitsTotal = produits.length;
    this.produitsActifs = produits.filter(p => p.actif).length;
  }

  // ------------------------------
  // Visites
  // ------------------------------
  public getVisitesMois() {
    const visites = this.mockVisites;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const visitesMensuelles = visites.filter((v: any) => {
      const date = new Date(v.date);
      return (
        date.getMonth() + 1 === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    this.visitesMois = visitesMensuelles.reduce((total, v) => total + v.nbVisites, 0);
  }
}
