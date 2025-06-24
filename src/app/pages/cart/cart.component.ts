import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/models/product.models';
import { User } from '../../models/user.models';
import { AuthenticationService } from 'src/app/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CountryService } from 'src/app/services/country.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/carte.service';
import { Observable } from 'rxjs';
import { RegionService } from 'src/app/services/region.service';
import { J } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  @Output() onQuantityChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() product: any;
  @Input() type: string;
  @ViewChild('simillarContainer', { static: false }) simillarContainer!: ElementRef;
  showSimilarNav = false;
  total = [];
  grandTotal = 0;
  cartItemCount = [];
  cartItemCountTotal = 0;
  user :User ;
  idUser :string;
  profil : string = "user";
  isSmallScreen: boolean = false;
  scrollAmount: number = 0;
  // selectedCountries = new FormControl([]);
  COUNTRY_ALIASES: { [key: string]: string } = {
    "Cote D'ivoire": "cotedivoire",
    "congo brazzaville": "republique du congo",
    "congo kinshasa": "rdc"
    // ajoute d'autres variantes si nécessaire
  };

  phoneMinLength: number = 8; // Longueur par défaut pour le Mali
  phoneMaxLength: number = 8; // Longueur par défaut pour le Mali
  phonePlaceholder: string = 'xxxxxxxx'; // Placeholder par défaut pour le Mali
  countries: any;
  selectedCountry: any;
  phoneMask: string = '00 00 00 00'; // Default mask for Mali
  isPopulatingForm: boolean = false;
  onlyProdTotal: any;
  referralCode: string = "";
  senderUsername: string = "";
  cities: any;
  isCapitalCity: boolean = false;
  isOtherRegion: boolean = false;
  isForeignCity: boolean = false;

  transportFee: number = 0;
  deliveryDelay: string = '';

  sellerCountry: any = null; // Pour stocker le pays du vendeur
  userContact: any;
  customerPhone: string = '';



  
  public count:number = 1;
  public productList: any[];
  pageName:string="cart";
  billingForm: UntypedFormGroup;

  constructor(private http: HttpClient, private breakpointObserver: BreakpointObserver, public appService:AppService,public snackBar: MatSnackBar,private regionService:RegionService,
    private authService:AuthenticationService, private carteService:CartService,  public router:Router,public formBuilder: UntypedFormBuilder, private countryService: CountryService
  ) { }

  ngOnInit() {
    this.getAllPays()
    this.initializeBillingForm();

    // Récupérer le code de parrainage depuis le sessionStorage
    const referralCode = sessionStorage.getItem('referralCode');
    const senderUsername = sessionStorage.getItem('senderUsername');
    if (referralCode && referralCode.length === 10 && senderUsername) {
    //  console.log("::::::::::::::: REFERRAL CODE = ",referralCode);
      this.referralCode = referralCode;
      this.senderUsername = senderUsername;
    }

    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
    .subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.getAllArticleInPanier();
    setTimeout(() => {
      this.onResize();
    });


    this.billingForm.get('phone')?.valueChanges.subscribe((phone: string) => {
      if (this.isPopulatingForm || !phone || !this.phoneMask || !this.selectedCountry) return;

      // Vérifie si la longueur du numéro est complète
      if (phone.length === this.phoneMask.length) {
      //  const fullPhoneNumber = this.selectedCountry.indicatif + phone;

        this.isPopulatingForm = true;
        this.customerPhone = phone;
        this.loadUserByPhone(phone);

        // Ne vide plus le champ ici

        // Débloquer après un court délai
        setTimeout(() => {
          this.isPopulatingForm = false;
        }, 100);
      }
    });

  }
  getCapitalByCountryName(name: string): Observable<any> {
    return this.http.get(`https://restcountries.com/v3.1/name/${name}`);
  }

  handleCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedCountry = datas;
      const id = this.selectedCountry.id;
//      this.getCityByCountry(datas.nom);
      this.getAllRegionsByCountry(id);

      let phoneLength = this.getPhoneLength(datas.nom);
      this.phoneMask = '0'.repeat(phoneLength);
      this.billingForm.controls['phone'].setValue('');


      // Reset shipping flags when country changes
      this.isCapitalCity = false;
      this.isOtherRegion = false;
      this.isForeignCity = false;
    });
  }

  getPhoneLength(countryName: string): number {
    const countryMap: { names: string[]; length: number }[] = [
      { names: ["bénin", "benin"], length: 8 },
      { names: ["burkina faso", "bourkina faso", "burkina"], length: 8 },
      { names: ["cap-vert", "cap vert"], length: 7 },
      { names: ["côte d'ivoire", "cote d'ivoire", "ivoire"], length: 10 },
      { names: ["gambie"], length: 7 },
      { names: ["ghana", "gana"], length: 9 },
      { names: ["guinée", "guinee"], length: 9 },
      { names: ["guinée-bissau", "guinée bissau", "bissau"], length: 7 },
      { names: ["libéria", "liberia"], length: 9 },
      { names: ["mali", "malie", "malin"], length: 8 },
      { names: ["niger", "nigér"], length: 8 },
      { names: ["nigeria", "nigéria"], length: 10 },
      { names: ["sénégal", "senegal"], length: 9 },
      { names: ["sierra leone", "leone"], length: 8 },
      { names: ["togo"], length: 8 },
      { names: ["tchad"], length: 8 },
      { names: ["tunisie", "tunis"], length: 8 },
      { names: ["zambie"], length: 9 },
      { names: ["zimbabwe"], length: 9 },
      { names: ["afrique du sud", "afrique sud", "sud afrique"], length: 9 },
      { names: ["botswana"], length: 9 },
      { names: ["burundi"], length: 9 },
      { names: ["cameroon", "cameroun"], length: 9 },
      { names: ["central african republic", "république centrafricaine"], length: 9 },
      { names: ["congo"], length: 9 },
    ];

    const normalizedInput = countryName.trim().toLowerCase();

    for (const entry of countryMap) {
      if (entry.names.some(name => name.toLowerCase() === normalizedInput)) {
        return entry.length;
      }
    }

    return 9; // Valeur par défaut
  }

  initializeBillingForm() {
    this.billingForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [''],
      username:[''],
      phone: ['', Validators.required],
      country: ['',Validators.required],
      city: ['', Validators.required],
    });

    // Add subscription to city changes
    this.billingForm.get('city')?.valueChanges.subscribe(cityId => {
      this.checkCityType(cityId);
    });
  }

  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     this.onResize();
  //     console.log(this.showSimilarNav);
  //   });
  // }

  @HostListener('window:resize')
  onResize() {
    if (this.simillarContainer) {
      const containerEl = this.simillarContainer.nativeElement;
      this.showSimilarNav = containerEl.scrollWidth > containerEl.clientWidth;
    }
  }

  ///::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  ///::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  ///::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  getAllArticleInPanier(){
    // Parse the stringified JSON array
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];


   // console.log("::::::::::::::: PRODUCT LIST = ",this.productList[0]);

    // Check if the productList is an array
    if (Array.isArray(this.productList)) {
      // Récupérer le pays du vendeur du premier produit
      if (this.productList.length > 0 && this.productList[0].user) {
        this.userContact = this.productList[0].contact;
        this.getSellerCountry(this.productList[0].contact);
      }

      this.productList.forEach(product => {
        this.total[product.id] = product.cartCount * parseFloat(product.priceBasic);
        if(product.pricePromotion){
          this.grandTotal += product.cartCount * parseFloat(product.pricePromotion);
        }
        else{
          this.grandTotal += product.cartCount * parseFloat(product.priceBasic);
        }

        this.cartItemCount[product.id] = product.cartCount;
        this.cartItemCountTotal += product.cartCount;
        this.product = product;
      });
    } else {
      console.error("Product list is not an array.");
    }
  }

  // Nouvelle méthode pour récupérer le pays du vendeur
  getSellerCountry(sellerId: string) {
    this.authService.getUserByPhone(sellerId).subscribe(
      (seller) => {

        if (seller && seller.countries) { 
          this.sellerCountry = seller.countries.id ? seller.countries : null;
          if (this.sellerCountry) {
            // Vérifier si le pays du vendeur est défini
            this.selectedCountry = this.sellerCountry;
            // this.getCityByCountry(this.sellerCountry.id);
          }
        }
      },
      (error) => {
        console.error("Erreur lors de la récupération des informations du vendeur:", error);
      }
    );
  }

  // Modifier la méthode checkCityType pour utiliser le pays du vendeur
  checkCityType(cityId: string) {

    if(this.selectedCountry.nom != this.sellerCountry.nom){
      this.isForeignCity = true;
      this.isCapitalCity = false;
      this.isOtherRegion = false;
      this.transportFee = 12000; // Frais de transport pour une ville étrangère
      this.deliveryDelay = '5 à 7 jours';
    }
    if(this.selectedCountry.nom == this.sellerCountry.nom){

      if(cityId == this.cities[0].id){
        this.isCapitalCity = true;
        this.isOtherRegion = false;
        this.isForeignCity = false;
        this.transportFee = 1500; // Frais de transport pour la capitale
        this.deliveryDelay = '48h';
      }else{
        this.isCapitalCity = false;
        this.isOtherRegion = true;
        this.isForeignCity = false;
        this.transportFee = 2500; // Frais de transport pour une autre région
        this.deliveryDelay = '3 à 4 jours';
      }

    }
  }

//:::::::::::::::::::::::::PANIER:::::::::::::::::::::::::::::::::::::::::::
monPanierContient(){
  this.appService.addCommande(this.idUser, this.senderUsername, this.referralCode, this.productList).subscribe(
    () => {
      this.snackBar.open('Commande effectuée avec succès', '×', {
        panelClass: 'success',
        verticalPosition: 'top',
        duration: 3000
      });
      this.clear()
       sessionStorage.removeItem('panier');
    sessionStorage.removeItem('totalCartCount');
        },
    error => {
      this.snackBar.open('Une erreur s\'est produite. Veillez réesayé !', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
      console.error("Erreur lors du réglage du statut de la campagne:", error);
    }
  );

}

onlyCartItemCount:any = 0
  public updateCart(value){
    let onlyProdTotal:any
    //console.log("My value = ",value);

    if(value){
      this.total[value.productId] = value.total;
      this.cartItemCount[value.productId] = value.soldQuantity;
      this.grandTotal = 0;
      this.total.forEach(price=>{
        this.grandTotal += price;
      });
      this.cartItemCountTotal = 0;
      this.cartItemCount.forEach(count=>{
        this.cartItemCountTotal +=count;
      });

      this.appService.Data.totalPrice = this.grandTotal;
      this.appService.Data.totalCartCount = this.cartItemCountTotal;

      this.appService.Data.cartList.forEach(product=>{
        this.cartItemCount.forEach((count,index)=>{
        });
      });

    }
    this.getAllArticleInPanier();

  }

  public remove(product) {
   this.appService.remove(product);
   this.getAllArticleInPanier();
  }

  public clear(){
    this.productList.forEach(product=>{
      this.appService.resetProductCartCount(product);
    });
    this.productList.length = 0;
    this.appService.Data.totalPrice = 0;
    this.appService.Data.totalCartCount = 0;
    this.carteService.updateCartCount(0)
    sessionStorage.removeItem('panier');
    sessionStorage.removeItem('totalCartCount');
  }

  public getProductDiscount(product: any): number {
    if(product.campagne && product.pricePromotion){
      const pricePromotion = parseFloat(product.pricePromotion);
      return (pricePromotion * product.campagne.reduction)/10
    }
    else{
      const priceBasic = parseFloat(product.priceBasic);
      return (priceBasic * product.campagne.reduction)/10
    }
  }

  swipeSimilarProduct(direction: 'left' | 'right'): void {
    const container = this.simillarContainer?.nativeElement;
    if (!container) return;
    const mobileStep = 120;
    const desktopStep = 180;

    const scrollStep = window.innerWidth >= 830 ? desktopStep : mobileStep;
    const maxScroll = container.scrollWidth - container.clientWidth;

    let newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollStep : scrollStep);

    if(newScrollPosition === (mobileStep+maxScroll)|| newScrollPosition === (desktopStep+maxScroll)){
      newScrollPosition = 0;
    }else{
      newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll));
    }

    container.scrollTo({ left: newScrollPosition, behavior: 'smooth' });
  }


  populateBillingForm(user: User) {
    this.isPopulatingForm = true; // Active le drapeau
    this.billingForm.patchValue({
      firstName: user.firstname || '',
      lastName: user.lastname || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      address: user.adresse || '',
    });
    this.isPopulatingForm = false; // Désactive le drapeau
  }

  loadUserByPhone(phone:string){
    this.authService.getUserByPhone(phone).subscribe(
      datas => {
        if(datas != null){
                this.populateBillingForm(datas);
                this.user = datas;
             //   sessionStorage.setItem('currentUser', JSON.stringify(this.user));
        }

          },
      error => {
        this.snackBar.open('Une erreur s\'est produite. Veillez réesayé !', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
        console.error("Erreur lors du chargement de user:", error);
      }
    );

  }



    onCountryChange(country: string): void {
      if (country === 'mali') {
        // Mali
        this.phoneMinLength = 8;
        this.phoneMaxLength = 8;
        this.phonePlaceholder = 'xxxxxxxx';
      } else if (country === 'civ') {
        // Côte d'Ivoire
        this.phoneMinLength = 10;
        this.phoneMaxLength = 10;
        this.phonePlaceholder = 'xxxxxxxxxx';
      }

      // Mettre à jour les validateurs de téléphone
      const phoneControl = this.billingForm.get('phone');
      phoneControl?.setValidators([
        Validators.required,
        Validators.minLength(this.phoneMinLength),
        Validators.maxLength(this.phoneMaxLength)
      ]);
      phoneControl?.updateValueAndValidity();
    }


    // getAllPays() {
    //   this.countryService.getAllCountries().subscribe(datas => {
    //     this.countries = datas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    //   })
    // }

    getAllPays() {
    this.countryService.getAllCountries().subscribe(datas => {
      this.countries = datas
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(country => ({
        ...country,
        mask: '0'.repeat(this.getPhoneLength(country.nom)),
        indicatif: `+${country.indicatif}`,
      }));
    //  this.selectedCountry = this.countries.find(c => c.nom === 'Mali');
    //  this.billingForm.controls['country'].setValue(this.selectedCountry?.id);
    })
  }

  getAllRegionsByCountry(id:string){
    this.countryService.getCityByCountry(id).subscribe(datas =>{
      this.cities = datas.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    })
  }

    normalizeCountryName(country: string): string {
    const cleaned = country
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return this.COUNTRY_ALIASES[cleaned] || cleaned;
  }


  getTotalReduction(): number {
    return this.productList.reduce((total, product) => {
      return total + ((product?.priceBasic || 0) * (product?.campagne?.reduction || 0) / 100 * product.cartCount);
    }, 0);
  }

  commander(){
    let user = this.user;
    //console.log("::::::::::::::: USER = ",user);
    if(user != null){
      // Appliquer la réduction aux articles avant l'envoi
    //   console.log("::::::::::::::: PRODUCT LIST = ",JSON.stringify(this.productList));
      const productsWithReduction = this.productList.map(product => {
        if (product.campagne && product.campagne.reduction) {
          const reductionAmount = (product.priceBasic * product.campagne.reduction / 100);
          const finalPrice = product.pricePromotion ? product.pricePromotion : (product.priceBasic - reductionAmount);
          return {
            ...product,
            user: product.user.id, // Ne garder que l'ID de l'utilisateur
            pricePromotion: finalPrice,
            totalPrice: finalPrice * product.cartCount
          };
        }
        return {
          ...product,
          user: product.user.id, // Ne garder que l'ID de l'utilisateur
          totalPrice: (product.pricePromotion || product.priceBasic) * product.cartCount
        };
      });

      this.appService.addCommande(user.id, this.senderUsername, this.referralCode, productsWithReduction).subscribe(
        () => {
          this.snackBar.open('Commande effectuée avec succès 1', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          this.clear()
          this.router.navigate(["/cart"]);
        },
        error => {
          this.snackBar.open('Une erreur s\'est produite. Veillez réesayé !', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
          console.error("Erreur lors la commande des articles:", error);
        }
      );
    }
    else if (this.billingForm.valid) {
      const values = this.billingForm.value;

      // Génération du numéro de téléphone complet basé sur le pays
      const countryCode = this.selectedCountry.indicatif;
      const phone = countryCode + values["phone"];

      // Création du payload
      const formData = new FormData();

      formData.append("username", phone);
      formData.append("firstname", values["firstName"]);
      formData.append("lastname", values["lastName"]);
      formData.append("password", values["phone"] || '');
      formData.append("phoneNumber", values["phone"]);
      formData.append("addresse", values["addresse"] || '');
      formData.append("countries", values["country"]);
      formData.append("state", values["state"] || '');
      formData.append("boutique", values["company"] || '');
      formData.append("role", this.profil || 'user');
      formData.append("typeOfUsername", 'phone');
      //formData.append('password', );

      if(this.referralCode){
        formData.append("parrainLogin", this.senderUsername );
        formData.append("isInvited", "true");
      }

      // Appliquer la réduction aux articles avant l'envoi
      const productsWithReduction = this.productList.map(product => {
        if (product.campagne && product.campagne.reduction) {
          const reductionAmount = (product.priceBasic * product.campagne.reduction / 100);
          const finalPrice = product.pricePromotion ? product.pricePromotion : (product.priceBasic - reductionAmount);
          return {
            ...product,
            user: product.user.id, // Ne garder que l'ID de l'utilisateur
            pricePromotion: finalPrice,
            totalPrice: finalPrice * product.cartCount
          };
        }
        return {
          ...product,
          user: product.user.id, // Ne garder que l'ID de l'utilisateur
          totalPrice: (product.pricePromotion || product.priceBasic) * product.cartCount
        };
      });

      // Création du compte
      this.authService.signup(formData).toPromise()
        .then(async (res: any) => {
          try {
            // Connexion de l'utilisateur
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;

            const loginData = await this.authService.login(username, password).toPromise();
            const userInfo = await this.authService.info(loginData.username);

            if (!userInfo) {
              throw new Error('Impossible de récupérer les informations du client, merci de réessayer à nouveau');
            }


            // Récupération de l'utilisateur par téléphone et ajout de la commande
            const phone = formData.get('phoneNumber') as string;
            const myUser = await this.authService.getUserByPhone(phone).toPromise();
            await this.appService.addCommande(myUser.id,this.senderUsername,this.referralCode, productsWithReduction).toPromise();

            this.snackBar.open('Commande effectuée avec succès', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });

            this.clear();
            this.router.navigate(["/cart"]);

          } catch (error: any) {
            console.error('Erreur lors du processus :', error);
            this.snackBar.open(error.message || 'Une erreur s\'est produite.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
          }
        })
        .catch((error: any) => {
          console.error('Erreur lors de la création du compte :', error);
          this.snackBar.open(error.message || 'Une erreur s\'est produite lors de la création du compte!', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.productList = this.productList.filter(product =>
      product.nom.toLowerCase().includes(filterValue.toLowerCase())
    );
  }


  openWhatsapp() {
      let message = "Bonjour, Je souhaiterais me renseigner sur les critèes de livraison sur fidelity.";
      const link = "https://wa.me/22376007979?text=" + encodeURIComponent(message);
      window.open(link, "_blank");
    
  }
}
