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
import {openKkiapayWidget, addKkiapayListener, removeKkiapayListener} from "kkiapay";
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
  indicatif: string = '';

  transportFee: number = 0;
  deliveryDelay: string = '';
  deliveryPrice: number = 0; // Prix de la livraison
  deliveryCountry: string = ''; // Pour stocker le pays de livraison

  sellerCountry: any = null; // Pour stocker le pays du vendeur
  userContact: any;
  customerPhone: string = '';

  hasForeignProducts: boolean = false;
  localSellersExistSee: boolean = false; // Pour vérifier si des vendeurs locaux existent


  
  public count:number = 1;
  public productList: any[];
  pageName:string="cart";
  billingForm: UntypedFormGroup;
  sellerCountries: any []=[] ;


  constructor(private http: HttpClient, private breakpointObserver: BreakpointObserver, public appService:AppService,public snackBar: MatSnackBar,private regionService:RegionService,
    private authService:AuthenticationService, private carteService:CartService,  public router:Router,public formBuilder: UntypedFormBuilder, private countryService: CountryService
  ) { }

  ngOnInit() {
    this.getAllPays()
    this.initializeBillingForm();

    // Récupérer le code de parrainage depuis le sessionStorage
    this.getAllArticleInPanier();
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
    
    addKkiapayListener('success',this.successHandler)
  }

  ngOnDestroy(){
    removeKkiapayListener('success')
  }

  handleCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedCountry = datas;
      const id = this.selectedCountry.id;
      this.indicatif = this.selectedCountry.indicatif; // Mettre à jour l'indicatif
      this.deliveryCountry = this.selectedCountry.nom; // Mettre à jour le pays de livraison
//      this.getCityByCountry(datas.nom);
      this.getAllRegionsByCountry(id);

      let phoneLength = this.getPhoneLength(datas.nom);
      this.phoneMask = '0'.repeat(phoneLength);
      this.billingForm.controls['phone'].setValue('');


      // Reset shipping flags when country changes
      this.isCapitalCity = false;
      this.isOtherRegion = false;
      this.isForeignCity = false;
      this.hasForeignProducts = false;
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
     // this.checkCityType(cityId);
     this.checkCityType(cityId, this.hasForeignProducts);

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

  async getAllArticleInPanier() {
    const panierString = sessionStorage.getItem('panier');
    this.productList = panierString ? JSON.parse(panierString) : [];
  
    this.grandTotal = 0;
    this.cartItemCountTotal = 0;
    this.hasForeignProducts = false;
  
    const countryNamesSet: Set<string> = new Set();      // Pour vérifier les noms
    const sellerCountriesSet: Set<any> = new Set();      // Pour stocker les pays objets
  
    if (Array.isArray(this.productList)) {
      for (const product of this.productList) {
     //   console.log("Je vais affiché le produit là = ",product)
        const sellerCountry = await this.getSellerCountry(product.contact);

      //  console.log("sellerCountry in getAllArticleInPanier = ",sellerCountry);

        const productCountryName = sellerCountry?.nom;
  
        if (productCountryName && !countryNamesSet.has(productCountryName)) {
          countryNamesSet.add(productCountryName);
          sellerCountriesSet.add(sellerCountry);
        }
  
        // Calculs
        const unitPrice = product.pricePromotion
          ? parseFloat(product.pricePromotion)
          : parseFloat(product.priceBasic);
  
        this.total[product.id] = product.cartCount * unitPrice;
        this.grandTotal += this.total[product.id];
        this.cartItemCount[product.id] = product.cartCount;
        this.cartItemCountTotal += product.cartCount;
      }
  
      // Tous les pays sans doublons (objets complets)
      this.sellerCountries = Array.from(sellerCountriesSet);
  
      // Vérifie si au moins un produit étranger est présent
      this.hasForeignProducts = Array.from(countryNamesSet).some(
        name => name !== this.selectedCountry.nom!
      );
    //  this.localSellersExistSee = this.hasForeignProducts;
  
     // console.log("🌍 Pays vendeurs (locaux + étrangers):", this.sellerCountries.map(c => c.nom));
      //console.log("📦 hasForeignProducts:", this.hasForeignProducts);
    } else {
      console.error("Product list is not an array.");
    }
  }
  

  // Nouvelle méthode pour récupérer le pays du vendeur
  getSellerCountry(sellerId: string): Promise<any> {
   // console.log("Seller country retrieved: ONE ", sellerId);
  
    return new Promise((resolve, reject) => {
      this.authService.getUserByPhone(sellerId).subscribe(
        (seller) => {
          //console.log("Seller country retrieved: ONE ", seller);
          const country = seller?.countries;
  
          if (country && country.id) {
            //console.log("Seller country OK: ONE ", country);

            resolve(country); // ✅ le pays est présent
          } else if (seller?.username) {
            // Extraire l'indicatif du numéro (ex: 223 pour le Mali)
            const phone = seller.username;
            const indicatif = phone.length >= 3 ? phone.substring(0, 3) : null;
  
            // Trouver le pays correspondant dans ta liste locale
            const foundCountry = this.countries?.find(
              (c: any) => c.indicatif === `+${indicatif}`
            );
  
            if (foundCountry) {
            //  console.log("Seller country found by indicatif: ONE ", foundCountry);
              resolve(foundCountry); // ✅ pays trouvé par l'indicatif
            } else {
              resolve(null); // ❌ pays non trouvé
            }
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération des informations du vendeur:", error);
          reject(error);
        }
      );
    });
  }
  

  

    checkCityType(city: any, hasForeignProducts: boolean = false) {
      if (!city || !this.selectedCountry || !this.sellerCountries) return;
    
      const isCapital = city?.capitale === true;
      const localSellersExist = this.sellerCountries.some(
        (c: any) => c.nom === this.selectedCountry.nom
      );
      this.localSellersExistSee = localSellersExist
    
      const foreignSellersExist = this.sellerCountries.some(
        (c: any) => c.nom !== this.selectedCountry.nom
      );
    
      // Cas 3 : tous les produits étrangers
      if (!localSellersExist && foreignSellersExist) {
        this.isForeignCity = true;
        this.isCapitalCity = false;
        this.isOtherRegion = false;
    
        this.transportFee = 12000;
        this.deliveryDelay = '5 à 7 jours';
        return;
      }
    
      // Cas 1 et 2 : que des produits locaux
      if (localSellersExist && !foreignSellersExist) {
       // this.hasForeignProducts = hasForeignProducts;
        this.isForeignCity = false;
    
        if (isCapital) {
          // Cas 1
          this.isCapitalCity = true;
          this.isOtherRegion = false;
          this.transportFee = 1500;
          this.deliveryDelay = '48h';
        } else {
          // Cas 2
          this.isCapitalCity = false;
          this.isOtherRegion = true;
          this.transportFee = 2500;
          this.deliveryDelay = '3 à 4 jours';
        }
        return;
      }
    
      // Cas 4 et 5 : produits locaux + étrangers
      if (localSellersExist && foreignSellersExist) {
        this.isForeignCity = false;
        this.hasForeignProducts = foreignSellersExist; // Mettre à jour l'état des produits étrangers
    
        if (isCapital) {
          // Cas 4
          this.isCapitalCity = true;
          this.isOtherRegion = false;
          this.transportFee = 1500 + 12000;
        } else {
          // Cas 5
          this.isCapitalCity = false;
          this.isOtherRegion = true;
          this.transportFee = 2500 + 12000;
        }
        this.deliveryDelay = '5 à 7 jours';
        return;
      }
    }
  
  
 

//:::::::::::::::::::::::::PANIER:::::::::::::::::::::::::::::::::::::::::::
monPanierContient(){
  let deliveryPrice = this.transportFee.toString();

  this.appService.addCommande(this.idUser, this.senderUsername, this.referralCode,deliveryPrice,this.deliveryCountry,this.deliveryDelay, this.productList).subscribe(
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

      this.appService.Data.totalPrice = this.grandTotal + this.transportFee;
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

              //  console.log("User loaded by phone:", this.user);  

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
     //this.selectedCountry = this.countries.find(c => c.nom === 'Mali');
     // this.billingForm.controls['country'].setValue(this.selectedCountry?.id);
     // this.getAllRegionsByCountry(this.selectedCountry.id);
      
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

  successHandler() {
    console.log("payment success...");
  }

  commander() {
    const user = this.user;
    const deliveryPrice = this.transportFee.toString();

    // Prépare la liste des produits avec réduction si applicable
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

    // Cas 1 : Utilisateur déjà connecté
    if (user != null) {

     // console.log("1 LES REDUCTS APPLIQUEE: ", productsWithReduction);

      this.appService.addCommande(
        user.id,
        this.senderUsername,
        this.referralCode,
        deliveryPrice,
        this.deliveryCountry,
        this.deliveryDelay,
        productsWithReduction
      ).subscribe(
        () => {
          // Paiement Kkiapay (si besoin)
          openKkiapayWidget({
            amount: (this.grandTotal + this.transportFee) - this.getTotalReduction(),
            api_key: "ed32fbf020e011f08a81bdf26ae54af2",
            sandbox: true,
            phone: "97000000",
          });
          
          this.snackBar.open('Commande initialisée avec succès', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          this.clear();
          this.router.navigate(["/"]);
        },
        error => {
          this.snackBar.open('Une erreur s\'est produite. Veillez réessayer !', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
          console.error("Erreur lors de la commande des articles:", error);
        }
      );
      return;
    }

    // Cas 2 : Nouveau client (création de compte)
    if (this.billingForm.valid) {
      const values = this.billingForm.value;
      const countryCode = this.selectedCountry.indicatif;
      const phone = countryCode + values["phone"];

      // Création du payload pour le compte
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
      if (this.referralCode) {
        formData.append("parrainLogin", this.senderUsername);
        formData.append("isInvited", "true");
      }

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

            // Ajout de la commande
            const phone = formData.get('phoneNumber') as string;
            const myUser = await this.authService.getUserByPhone(phone).toPromise();

         //   console.log("2 LES REDUCTS APPLIQUEE: ", productsWithReduction);


            await this.appService.addCommande(
              myUser.id,
              this.senderUsername,
              this.referralCode,
              deliveryPrice,
              this.deliveryCountry,
              this.deliveryDelay,
              productsWithReduction
            ).subscribe(
              () => {
                // Paiement Kkiapay (si besoin)
                openKkiapayWidget({
                  amount: (this.grandTotal + this.transportFee) - this.getTotalReduction(),
                  api_key: "ed32fbf020e011f08a81bdf26ae54af2",
                  sandbox: true,
                  phone: "97000000",
                });
                this.snackBar.open('Commande initialisée avec succès', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000
                });
                this.clear();
                this.router.navigate(["/"]);
              },
              error => {
                this.snackBar.open('Une erreur s\'est produite. Veillez réessayer !', '×', {
                  panelClass: 'error',
                  verticalPosition: 'top',
                  duration: 3000
                });
                console.error("Erreur lors de la commande des articles:", error);
              }
            );

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