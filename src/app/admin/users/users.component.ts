import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  enabled: boolean;
  createdAt: Date;
  profiles: { name: string }[];
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent implements OnInit {
onPageChanged($event: number) {
throw new Error('Method not implemented.');
}
remove(_t314: any) {
throw new Error('Method not implemented.');
}
  public users: User[] = [];
  public filteredUsers: User[] = []; // 🔹 liste filtrée
  public sortedUsers: User[] | null = null;
  public searchText: string = '';
  public page: number = 1;

  selectedCountry: string = '';
  countries: string[] = [];

  isAboveSmSize$: Observable<boolean>;
  isAboveMdSize$: Observable<boolean>;

  ascFirstname = true;
  ascLastname = true;
  ascType = true;
  ascMember = true;

  constructor(
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.isAboveSmSize$ = this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(result => result.matches));

    this.isAboveMdSize$ = this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(result => result.matches));

    this.getUsers();
  }

  // 🔹 Données mock
  public getUsers(): void {
    this.users = [
      {
        id: '1',
        firstname: 'Jean',
        lastname: 'Dupont',
        username: 'jdupont',
        email: 'jean.dupont@example.com',
        phoneNumber: '+22370000001',
        adresse: 'Rue 123',
        ville: 'Bamako',
        pays: 'Mali',
        enabled: true,
        createdAt: new Date('2022-01-15'),
        profiles: [{ name: 'admin' }]
      },
      {
        id: '2',
        firstname: 'Awa',
        lastname: 'Traoré',
        username: 'atraore',
        email: 'awa.traore@example.com',
        phoneNumber: '+22370000002',
        adresse: 'Quartier Médina',
        ville: 'Sikasso',
        pays: 'Mali',
        enabled: false,
        createdAt: new Date('2023-03-22'),
        profiles: [{ name: 'user' }]
      },
      {
        id: '3',
        firstname: 'Moussa',
        lastname: 'Konaté',
        username: 'mkonate',
        email: 'moussa.konate@example.com',
        phoneNumber: '+22370000003',
        adresse: 'Avenue Kankou Moussa',
        ville: 'Kayes',
        pays: 'Sénégal',
        enabled: true,
        createdAt: new Date('2021-11-10'),
        profiles: [{ name: 'editor' }]
      }
    ];

    // 🔹 initialiser pays et liste filtrée
    this.countries = [...new Set(this.users.map(u => u.pays).filter(Boolean))];
    this.filteredUsers = [...this.users];
  }

  // 🔹 Filtrer par pays
  filterByCountry(): void {
    if (!this.selectedCountry) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => u.pays === this.selectedCountry);
    }
  }

  // 🔹 Supprimer un utilisateur
  public deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.filterByCountry();
  }

  // 🔹 Réinitialiser mot de passe
  public reset(username: string) {
    alert(`Mot de passe de ${username} réinitialisé (mock).`);
  }

  // 🔹 Ajouter / Modifier
  public openUserDialog(user: User | null, action: string) {
    this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: { user, action }
    }).afterClosed().subscribe((result) => {
      if (!result) return;

      if (action === 'add') {
        const newUser: User = {
          id: (this.users.length + 1).toString(),
          firstname: result.firstname,
          lastname: result.lastname,
          username: result.username,
          email: result.email,
          phoneNumber: result.phoneNumber,
          adresse: result.adresse,
          ville: result.ville,
          pays: result.pays,
          enabled: true,
          createdAt: new Date(),
          profiles: [{ name: result.profiles?.[0]?.name || 'user' }]
        };
        this.users.push(newUser);
      } else if (action === 'update' && user) {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index > -1) {
          this.users[index] = { ...this.users[index], ...result };
        }
      }
      this.filterByCountry();
    });
  }

  // 🔹 Activer/Désactiver
  setStatus(id: string, event: MatSlideToggleChange): void {
    const user = this.users.find(c => c.id === id);
    if (user) {
      user.enabled = event.checked;
    }
  }

  // 🔹 Tri (adapté pour filteredUsers)
  sortUsers(keyWord: string) {
    const ascKey = `asc${keyWord.charAt(0).toUpperCase() + keyWord.slice(1)}`;
    if (this[ascKey] === undefined) {
      this[ascKey] = true;
    }
    const isAscending = this[ascKey];
    const sortOrder = isAscending ? 1 : -1;

    this.sortedUsers = [...this.filteredUsers].sort((a, b) => {
      const valueA = this.getSortValue(a, keyWord);
      const valueB = this.getSortValue(b, keyWord);

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB, 'fr', { sensitivity: 'base' }) * sortOrder;
      }

      if (valueA < valueB) return -sortOrder;
      if (valueA > valueB) return sortOrder;
      return 0;
    });

    this[ascKey] = !isAscending;
  }

  getSortValue(user: User, keyWord: string): any {
    switch (keyWord) {
      case 'firstname':
        return user.firstname?.trim().toLowerCase() || '';
      case 'lastname':
        return user.lastname?.trim().toLowerCase() || '';
      case 'type':
        return user.profiles[0]?.name.toLowerCase() || '';
      case 'member_since':
        return new Date(user.createdAt).getTime() || 0;
      default:
        return '';
    }
  }
}
