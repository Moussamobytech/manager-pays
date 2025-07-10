import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { matchingPasswords } from '../../../theme/utils/app-validators';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ImageCompressService } from 'src/app/services/image-compress.servive';
import { CommonService } from 'src/app/services/common.service';
import { MatSelectChange } from '@angular/material/select';
import { CountryService } from 'src/app/services/country.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BannersService } from 'src/app/services/banners.service';
import { CampagneService } from 'src/app/services/campagne.service';
import { ProductService } from 'src/app/services/product.service';
import { log } from 'console';



@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {


  @Input() fileAccept: string = 'image/*';
  @Input() isDisabled: boolean = false;

  @Output() fileSelected = new EventEmitter<File>();
  onNativeInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
    }
  }
  
  infoForm: UntypedFormGroup;
  passwordForm: UntypedFormGroup;
  currentUser: any
  hide = true;
  hide1 = true;
  hide2 = true;
  wordCount: number = 0;
  maxWords: number = 70;
  imgLink: string = "https://image.geotrac.io/minio/api/v1/view?bucket=ecommerce-bucket&file=";

  selectedTab = 'general';
  phoneMask: string = '00 00 00 00'; // Default mask for Mali
  tabs = [
    { value: 'general', label: 'Informations générales', sublabel: 'Nom, adresse, contacts', icon: 'user' },
    { value: 'security', label: 'Sécurité du compte', sublabel: 'Mot de passe', icon: 'shield' },
    { value: 'appearance', label: 'Apparence de ma boutique', sublabel: 'Logo, couleurs, bannière', icon: 'palette' },
    // { value: 'shipping', label: 'Gestion de la livraison', sublabel: 'Zones, tarifs, délais', icon: 'truck' },
    // { value: 'payments', label: 'Paiments', sublabel: 'Méthodes, commissions', icon: 'credit-card' },
    //{ value: 'notifications', label: 'Notifications', sublabel: 'Email, SMS, WhatsApp', icon: 'bell' },
    { value: 'help', label: 'Besoin d\'aide', sublabel: 'Contacter l\'équipe Fidelity', icon: 'circle-info' }
  ];



  // availableCountries = ['Mali', 'Senegal', 'Ivory Coast'];
  public selectedCountries: string[] = [];
  countries: any[] = [];
  countryRegions: { [key: string]: string[] } = {};
  selectedCountry: any;
  bannieres: any[];
  mesRegions: any[] = [];

  sellerId: string;
  shopLink: string;
  logoExiste: any;
  produitsLength: any = 0;


  public LogoForm: UntypedFormGroup;
  defaultLogo = 'assets/images/icons/shop_icon.png';
  selectedLogo: File | null = null;
 
  uploadingLogo: boolean = false;


  constructor(public formBuilder: UntypedFormBuilder,
    private auth: AuthenticationService,
    private bannersService: BannersService,
    public snackBar: MatSnackBar,
    private imgCompressService: ImageCompressService,
    private cm: CommonService,
    private router: Router,
    private countryService: CountryService,
    private activatedRoute: ActivatedRoute,
    private campagneService: CampagneService,
    private productService: ProductService,
  ) { }
  async ngOnInit() {
    this.loadCountries();
    this.currentUser = this.auth.currentUser();
    let cur = this.currentUser;
    this.stats(this.currentUser.username);


    this.activatedRoute.params.subscribe((params) => {
      this.sellerId = params['sellerId'];
      let code = params['code'];

      if(this.sellerId?.length < 3) {
        this.router.navigate(['/']);
        return;
      }

      this.shopLink = this.sellerId;

      if(code && code.length == 10){
        // Stocker le code dans le sessionStorage
        sessionStorage.setItem('referralCode', code);
        this.getSellerFromCode(code);
      } else {
        // Vérifier si un code existe déjà dans le sessionStorage
        const storedCode = sessionStorage.getItem('referralCode');
        if(storedCode && storedCode.length == 10) {
          this.getSellerFromCode(storedCode);
        }
      }
    });

    let bgs = [cur.bg1, cur.bg2, cur.bg3];
    // Images de l'utilisateur actuel
    const curBanners: any[] = bgs.filter(item => item).map(item => ({ preview: this.imgLink + item }));

    // Récupération des bannières serveur
    this.bannersService.getBannersByUsername(cur.username).subscribe(datas => {

    //  console.log("Bannières récupérées du serveur:", datas);

      const serverBanners = [datas?.image1, datas?.image2, datas?.image3]
        .filter(img => img)
        .map(img => ({ preview: img }));

      this.bannieres = serverBanners.length > 0 ? serverBanners : curBanners;

    //  console.log("Bannières fusionnées:", this.bannieres);

      const mergedBanners = [0, 1, 2].map(i => {
        const serverImg = serverBanners[i]?.preview;
        const localImg = curBanners[i]?.preview;
        return { preview: serverImg || localImg };
      });
      this.bannieres = mergedBanners;
      this.infoForm.patchValue({
        banners: mergedBanners
      });
      }
      
    );

    const logo = [{ preview: this.imgLink + cur.logo }];
    this.logoExiste = cur.logo; // Vérifie si le logo existe
    const description = cur.description || "";
    this.wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

    this.infoForm = this.formBuilder.group({
      firstname: [(cur.firstname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      lastname: [(cur.lastname || null), Validators.compose([Validators.required, Validators.minLength(3)])],
      phoneNumber: [cur.phoneNumber, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8)])],
      profiles: [cur.profiles || null],
      boutiqueName: [cur.name || null],
      adresse: [cur.adresse || null],
      // ////////////////////////////////////////////////
      email: [(cur.email || null), Validators.pattern(/^[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
     // description: [cur.description || null],
      description: [cur.description || null, [Validators.maxLength(70)]],
      logo: [logo || null],
      banners: [curBanners || null],
      country: [cur.countries?.id || null],
      city: [(null)],
      deliveryCountries: this.formBuilder.array([])
    });
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required],
    }, { validator: [matchingPasswords('newPassword', 'confirmNewPassword')] });
  }

  get deliveryCountries(): FormArray {
    return this.infoForm.get('deliveryCountries') as FormArray;
  }

  loadCountries() {
    this.countryService.getAllCountries().subscribe({
      next: (data) => {
        this.countries = data;
        // Stocker les régions pour chaque pays
        this.countries.forEach(country => {
          this.countryRegions[country.nom] = country.regions || [];
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des pays:', err);
      }
    });
  }

  getRegionsForCountry(name: string) {
    this.countryService.getAllRegionsByCountrieName(name).subscribe({
      next: (datas) => {
        this.mesRegions = datas;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des régions:', err);
      }
    });
  }

  onRegionsChange(event: any, index: number) {
    const selectedRegions = event.value;
    const countryGroup = this.deliveryCountries.at(index);
    countryGroup.patchValue({ regions: selectedRegions });
  }

  handleCountryChange(event: any) {
    this.countryService.getById(event.value).subscribe(datas => {
      this.selectedCountry = datas
      // Définir le masque en fonction du pays sélectionné
      let phoneLength = this.getPhoneLength(datas.nom); // Récupérer la longueur du numéro
      this.phoneMask = '0'.repeat(phoneLength); // Génère un masque comme "000000000"
      // Réinitialiser le champ de téléphone
      this.infoForm.controls['phoneNumber'].setValue('');
    })
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

  public async onInfoFormSubmit(values: any): Promise<void> {
    if (!this.infoForm.valid) return;
  
    if (this.wordCount === this.maxWords) {
      this.cm.openFailureSnackBar("La description ne doit pas dépasser 70 mots.");
      return;
    }
  
  
    const data: {
      firstname: any;
      lastname: any;
      phoneNumber: any;
      email: any;
      adresse: any;
      name: any;
      description: any;
      type: string;
      idCountry: any;
      bg1?: File;
      bg2?: File;
      bg3?: File;
      logo?: any;
    } = {
      firstname: values.firstname,
      lastname: values.lastname,
      phoneNumber: values.phoneNumber,
      email: values.email,
      adresse: values.adresse,
      name: values.boutiqueName,
      description: values.description,
      type: this.currentProfile(values.profiles),
      idCountry: values.country,
      logo: values.logo
    };
  
  
    // 🧠 Récupérer le vrai fichier depuis l'objet InputFile
    let logoFile: File | null = null;
    if (Array.isArray(data.logo) && data.logo.length > 0) {
      const logoInput = data.logo[0];
      if (logoInput?.file instanceof File) {
        logoFile = logoInput.file;
      }
    }
  
    // 🗜️ Compression et upload du logo si présent
    if (logoFile) {
      try {
        const compressed = await this.imgCompressService.compressImage(logoFile, 1200, 800, 70);
        const renamed = new File([compressed], `logo-${Date.now()}.jpeg`, { type: compressed.type });
        await this.auth.uploadImange(this.currentUser.username, renamed).toPromise();
      } catch (err) {
        console.error("Erreur lors de la compression du logo :", err);
      }
    }
  
    // 📤 Mise à jour des infos texte
    const res = await this.auth.updateUserInfo(this.currentUser.id, data);
  
    if (res === "OK") {
      this.snackBar.open('Les informations de votre compte ont été mises à jour avec succès !', '×', {
        panelClass: 'success',
        verticalPosition: 'top',
        duration: 3000,
      });
  
      this.currentUser = await this.auth.info(this.currentUser.username);
  
      // 📦 Compression des bannières
      const banners: { bg1: File | null; bg2: File | null; bg3: File | null } = { bg1: null, bg2: null, bg3: null };
      const compressedFiles = await this.compressAndPrepareImages();
  
      compressedFiles.forEach((file, i) => {
        banners[`bg${i + 1}` as keyof typeof banners] = file;
      });
  
      if (banners.bg1 || banners.bg2 || banners.bg3) {
        const formData = new FormData();
        formData.append('userId', this.currentUser.id);
        if (banners.bg1) formData.append('image1', banners.bg1);
        if (banners.bg2) formData.append('image2', banners.bg2);
        if (banners.bg3) formData.append('image3', banners.bg3);
        await this.bannersService.addBanners(formData).toPromise();
      }
  
      this.router.navigate(['/account-seller/settings']);
    } else {
      this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations !', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000,
      });
    }
  }
  
  
  
 /* public async onInfoFormSubmit(values: any): Promise<void> {
    if (!this.infoForm.valid) return;

    if (this.wordCount == this.maxWords) {
      this.cm.openFailureSnackBar("La description ne doit pas dépasser 70 mots.");
      return;
    }

    console.log("1 ::::: Form data to be submitted:", this.infoForm.value);

    // Déclaration du type
    const data: { firstname: any; lastname: any; phoneNumber: any;
      email: any; adresse: any;name: any;description: any;
      type: string; idCountry: any;bg1?: File;bg2?: File;bg3?: File; logo?: File }
      = {
      firstname: values.firstname,
      lastname: values.lastname,
      phoneNumber: values.phoneNumber,
      email: values.email,
      adresse: values.adresse,
      name: values.boutiqueName,
      description: values.description,
      type: this.currentProfile(values.profiles),
      idCountry: values.country,
      logo: values.logo // Initialisé à null, sera mis à jour si un logo est sélectionné
    };


    console.log("2 Logo ::::: Form data to be submitted:", data.logo);

    const res = await this.auth.updateUserInfo(this.currentUser.id, data);

   // console.log("::::: RES Form data to be submitted:", res);


    if (res === "OK") {
      this.snackBar.open('Les informations de votre compte ont été mises à jour avec succès !', '×', {
        panelClass: 'success',
        verticalPosition: 'top',
        duration: 3000,
      });
      this.currentUser = await this.auth.info(this.currentUser.username);
        // Préparer les fichiers de bannière (bg1, bg2, bg3)
      const banners: { bg1: File | null; bg2: File | null; bg3: File | null } = { bg1: null, bg2: null, bg3: null };

      const compressedFiles = await this.compressAndPrepareImages();
      compressedFiles.forEach((file, i) => {
        banners[`bg${i + 1}` as keyof typeof banners] = file;
      });
      // Ajouter les bannières si elles existent
      if (banners.bg1) data.bg1 = banners.bg1;
      if (banners.bg2) data.bg2 = banners.bg2;
      if (banners.bg3) data.bg3 = banners.bg3;
      if(data.bg1 || data.bg2 || data.bg3){
        const formData = new FormData();
        formData.append('userId', this.currentUser.id);
        formData.append('image1', data.bg1);
        formData.append('image2', data.bg2);
        formData.append('image3', data.bg3);
        this.bannersService.addBanners(formData).toPromise();

      }
      this.router.navigate(['/account-seller/settings']);
      } else {
        this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations !', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    }
    */


  public async onPasswordFormSubmit(values: Object): Promise<void> {
    if (this.passwordForm.valid && this.passwordForm.value.newPassword) {
      let data: any = {
        username: this.currentUser.username,
        password: this.passwordForm.value.currentPassword,
        newpassword: this.passwordForm.value.newPassword
      };

      try {
        let res: any = await this.auth.updatePassword(data);
        if (res === "OK") {
          this.snackBar.open('Your password changed successfully!', '×', { panelClass: 'success', verticalPosition: 'top', duration: 3000 });
          // window.location.reload();
        } else {
          this.snackBar.open(res.message || 'Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
        }
      } catch (error: any) {
        this.snackBar.open('Une erreur est intervenue lors de la mise à jour de vos informations!', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
      }
    }
  }

  currentProfile(roles) {
    let key = roles[0].name
    let profil = ""
    switch (key) {
      case "ROLE_PARTICULIER":
        profil = "particulier"
        break;
      case "ROLE_BOUTIQUE":
        profil = "Boutique"
        break
      case "ROLE_ADMIN":
        profil = "Administrateur"
        break;
      case "ROLE_USER":
        profil = "Utilisateur"
        break;
      default:
        profil = "N/A"
        break;
    }
    return profil
  }

  async compressAndPrepareImages(): Promise<File[]> {
    const compressedImagePromises = this.infoForm.value.banners.map(async (item: any) => {
      if (item.file) {
        // L'image est locale (venant d'un input file)
        const compressedBlob = await this.imgCompressService.compressImage(item.file, 1200, 1000, 100);
        const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
        return new File([compressedBlob], randomName, { type: compressedBlob.type });
      } else if (item.preview) {
        // L'image est une URL (déjà uploadée), on la télécharge depuis le backend
        const file = await this.bannersService.convertUrlToFile(item.preview);
        const compressedBlob = await this.imgCompressService.compressImage(file, 1200, 1000, 100);
        const randomName = `img-${Math.random().toString(36).substring(2, 15)}.jpeg`;
        return new File([compressedBlob], randomName, { type: compressedBlob.type });
      } else {
        return null;
      }
    });

    // Filtrer les fichiers null (au cas où)
    const files = await Promise.all(compressedImagePromises);
    return files.filter((f): f is File => f !== null);
  }

  updateDescriptionWordCount(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  }

  onDescriptionInput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    const words = value.trim().split(/\s+/);
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (words.length >= this.maxWords && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  async convertUrlToFile(url: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "converted.jpeg", { type: blob.type });
    return file;
  }

  onTabChange(event: MatSelectChange) {
    this.selectedTab = event.value;
    if( this.selectedTab === 'payments' ){
      this.cm.goTo("/account-seller/pricing")
    }
  }

  handleTabClick(value:any){
    this.selectedTab = value;
  }

  getSelectedIcon(): string {
    return this.tabs.find(tab => tab.value === this.selectedTab)?.icon || '';
  }

  getSelectedLabel(): string {
    return this.tabs.find(tab => tab.value === this.selectedTab)?.label || 'Sélectionner';
  }

  addDeliveryCountry(event: any) {
    const country = event.value;
    if (!this.selectedCountries.includes(country)) {
      this.selectedCountries.push(country);
      this.deliveryCountries.push(this.formBuilder.group({
        name: [country],
        nationalDeliveryPrice: ['', [Validators.required, Validators.min(0)]],
        deliveryPrice: ['', [Validators.required, Validators.min(500)]],
        regions: [[]]
      }));
      this.getRegionsForCountry(country);
    }
  }

  removeCountry(index: number, countrySelect: any) {
    this.selectedCountries.splice(index, 1);
    this.deliveryCountries.removeAt(index);
    if (this.selectedCountries.length === 0) {
      countrySelect.value = null;
    }
  }

  getSellerFromCode(code: string) {
    this.campagneService.getCampagneByCode(code).subscribe(datas => {
      this.sellerId = datas.user.username;
      if (this.sellerId.length <= 8) {
        this.cm.goTo("/");
      } else {
        this.shopLink = window.location.origin + "/#/sellers/" + this.sellerId + "/" + code;
      }
    });
  }


  public stats(id) {
    this.productService.stats(id).then((data: any) => {
      this.produitsLength =  data.actif;
    });
  }



  
  onLogoAccepted(inputFile: { file?: File, preview?: string | ArrayBuffer, link?: string }) {
    console.log('✅ Logo accepté :', inputFile);
  
    if (inputFile.file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.infoForm.patchValue({
          logo: [{ file: inputFile.file, preview: reader.result as string }] // <-- cast here
        });
      };
      reader.readAsDataURL(inputFile.file);
    }
  }
  
  

  
  
}

