
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  remainingPlaces = 27;

  plans = [
    {
      title: 'STARTER',
      commission: '15%',
      subtitle: 'Pour démarrer votre activité',
      color: 'primary',
      buttonText: 'Démarrer gratuitement',
      features: [
        'Inscription gratuite',
        'Sans abonnement',
        'Aucuns frais cachés',
        'Livraison Afrique/Europe',
        'Mobile Money/Carte partout',
        'Boutique personnalisée',
        'Notifications WhatsApp',
        'Vente Afrique/Europe',
        'Réseau de revendeurs'
      ]
    },
    {
      title: 'PRO',
      commission: '10%',
      subtitle: 'Pour vendeurs > 1 million FCFA/mois',
      color: 'accent',
      buttonText: 'Passer au Pro',
      features: [
        'Inscription gratuite',
        'Sans abonnement',
        'Aucuns frais cachés',
        'Livraison Afrique/Europe',
        'Mobile Money/Carte partout',
        'Tout du forfait STARTER +',
        'Visibilité prioritaire',
        'Amélioration photos IA',
        'Support prioritaire (24h)'
      ]
    },
    {
      title: 'BUSINESS',
      commission: '7%',
      subtitle: 'Pour vendeurs > 2 millions FCFA/mois',
      color: 'warn',
      buttonText: 'Devenir Business',
      features: [
        'Inscription gratuite',
        'Sans abonnement',
        'Aucuns frais cachés',
        'Livraison Afrique/Europe',
        'Mobile Money/Carte partout',
        'Tout du forfait PRO +',
        'Mise en avant sur l\'accueil',
        'Stats + outils marketing',
        'Formations exclusives'
      ]
    }
  ];

  sellerAdvantages = [
    'Outils marketing avancés',
    'Réseau de revendeurs',
    'Outils promo pour booster vos ventes'
  ];

  resellerAdvantages = [
    'Catalogues sans investissement',
    'Démarrer sans expertise',
    'Coaching pour se lancer avec zéro franc'
  ];

  constructor() { }

  ngOnInit() {
  }

}
