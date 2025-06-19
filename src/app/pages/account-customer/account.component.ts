import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CommonService } from 'src/app/services/common.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { ProductService } from 'src/app/services/product.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  defaultLogoUrl = 'assets/images/icons/user_icon.png';
  showMoreCards: boolean = false;
  displayedOrdersCount: number = 3; // Nombre initial d'ordres affichés
  cards = [
    { icon: 'fas fa-sack-dollar', title: 'Mes gains', content: '0F', routerLink: 'earnings', cardClass: 'amber' },
    { icon: 'fas fa-exchange-alt', title: 'Invite tes amis', content: 'Gagne jusqu\'à 5000 F par ami invité !', routerLink: '/referal', cardClass: 'primary' },
    { icon: 'fa-solid fa-phone', title: 'Mettre à jour', content: 'Mon numéro de téléphone', routerLink: 'settings', cardClass: 'primary' },
    { icon: 'fas fa-chart-line', title: 'Devenir revendeur', content: 'Gagner des commissions sur chaque vente !', routerLink: '', cardClass: 'amber', action: 'WhatsAppUs' },
  ];
  historiqueData = [
  { image: 'assets/images/ads/3.jpg', name: 'Chemise homme', price: '35 000F', status: 'Livrée', date: '05/02/2025', color: 'accent' },
  { image: 'assets/images/ads/1.jpg', name: 'Robe femme', price: '15 000F', status: 'En attente', date: '05/02/2025', color: 'amber' },
  { image: 'assets/images/ads/3.jpg', name: 'Sac à dos', price: '20 000F', status: 'Annulée', date: '05/02/2025', color: 'warn' },
  ];
  selectedLogo: File | null = null ;
  public currentUser:any = this.auth.currentUser();
  selectedTab = 'historique';
  favorisProducts:Product[] = [];
  user:any;
  orders: any[] = [];
  status: any[] = [];
  showMoreOrders: boolean = false;
  displayedColumns: string[] = ['produit', 'quantite', 'montant', 'date', 'statut'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('input') input: ElementRef;
  pageSize = 10;
  pageSizeOptions = [10, 20, 30];
  tailles: any;
  referralHistory: any;
  balance:any = 0;

  constructor(
    private auth: AuthenticationService, 
    private imgCompressService: ImageCompressService,
    private cm: CommonService, 
    private produitService: ProductService,
    private commandeService: CommandeService
  ) { }

  produitsLikes:any;

  async ngOnInit() {
   // this.favorisProducts = await this.produitService.getProductByNewArrival(50)
    //console.log('FAVORIS = :::::::::::: ',this.favorisProducts);
    this.currentUser = this.auth.currentUser()
    
    this.user = this.currentUser;
    this.getAllCommande();    
    this.getProduitsLikes();
    this.loadReferralHistory();
  }


  getProduitsLikes(){
    this.produitService.getProduitsLikesByUser(this.currentUser.id).subscribe(datas =>{
      this.tailles = datas.length;
        
      // Marquer tous les produits comme favoris
      this.produitsLikes = datas.map(product => ({
        ...product,
        isFavorite: true
      }));
      this.favorisProducts = this.produitsLikes;
    });
  }

  loadReferralHistory() {
    this.auth.gainList(this.currentUser.id).subscribe(
      (data) => {
        this.referralHistory = data;
        for (let i = 0; i < this.referralHistory.length; i++) {
          this.balance += this.referralHistory[i].montant;
          this.cards[0].content = this.balance + 'F';
        }}
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = (input.files[0]);
      let logoName = this.selectedLogo.name;
      try{
        let logo: File = this.selectedLogo;
        let isFileAllowed:boolean = logo.type.includes("image/")
        // Ajout du logo
        if(isFileAllowed){
          if (logo) {
            this.imgCompressService.compressImage(logo,1200,1000,70).then( async (Bloblogo) => {
              // I must convert blob type to File first
              const randomName = `logo-${Math.random().toString(36).substring(2, 15)}.jpeg`;
              let editedLogo = new File([Bloblogo], randomName, { type: Bloblogo.type });

              await this.auth.uploadImange(this.currentUser.username,editedLogo).toPromise();
              this.currentUser = await this.auth.info(this.currentUser.username);
              this.selectedLogo = null;
            });
          }
        }else{
          this.cm.openFailureSnackBar("Format incorrect, veillez choisir une image!");
        }
      }catch(error:any){
        console.log(error);
      }
    }
  }

  getAllCommande() {
    this.commandeService.getAllCommandeByUsername(this.user.username).subscribe(datas => {
      this.orders = datas;
      
      this.dataSource = new MatTableDataSource<any>(this.orders);
      this.dataSource.paginator = this.paginator;
      // Configurer le filtre pour rechercher dans plusieurs champs
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = (
          data.produitNom?.toLowerCase() + ' ' +
          data.montant?.toString() + ' ' +
          data.quantite?.toString() + ' ' +
          data.dateCommande?.toLowerCase()
        ).trim();
        return searchStr.indexOf(filter) !== -1;
      };
    }, error => {
      console.error('Error during recharge:', error);
    });
  }

  getAllStatus(){
    this.commandeService.getAllStatusCommander().subscribe(datas => {
      this.status = datas;
    }, error => {
      console.error('Error during recharge:', error);
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  WhatsAppUs(card: string) {
    //console.log(card);
    if(card.toLowerCase().includes("revendeur")){
      let message = "Bonjour, Je souhaiterais postuler pour devenir revendeur sur Fidelity Market.";
      const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
      window.open(link, "_blank");
    }
  }

  getStatusColor(status: string): string {
    switch(status.toUpperCase()) {
      case 'PENDING':
        return 'amber'; // #feb930 (jaune/orange)
      case 'DELIVERED':
        return 'accent'; // #548580 (vert)
      case 'CANCEL':
        return 'warn'; // #d81b60 (rouge)
      case 'VALIDE':
        return 'primary'; // #25224a (bleu foncé)
      default:
        return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch(status.toUpperCase()) {
      case 'PENDING':
        return 'En attente';
      case 'DELIVERED':
        return 'Livré';
      case 'CANCEL':
        return 'Annulé';
      case 'VALIDE':
        return 'Validé';
      default:
        return status;
    }
  }

  loadMoreOrders() {
    this.displayedOrdersCount += 3; // Ajoute 3 ordres supplémentaires
  }

  shouldShowSearch(): boolean {
    return this.orders.length > 10;
  }

  toggleShowMore() {
    this.showMoreOrders = !this.showMoreOrders;
    if (this.showMoreOrders) {
      this.updateDataSource();
    }
  }

  updateDataSource() {
    this.dataSource = new MatTableDataSource<any>(this.orders);
    this.dataSource.paginator = this.paginator;
    // Réappliquer le filterPredicate lors de la mise à jour
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = (
        data.produitNom?.toLowerCase() + ' ' +
        data.montant?.toString() + ' ' +
        data.quantite?.toString() + ' ' +
        data.dateCommande?.toLowerCase()
      ).trim();
      return searchStr.indexOf(filter) !== -1;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
