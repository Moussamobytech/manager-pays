import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-referal-carousel',
  templateUrl: './referal-carousel.component.html',
  styleUrls: ['./referal-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReferalCarouselComponent implements OnInit {
  public slides = [
      {title: 'PARTAGEZ VOTRE CODE DE PARRAINAGE',subtitle: 'Offrez -10% à vos proches sur leur première commande et recevez des points de fidélité en échange.',image: 'assets/images/ads/1.jpg'},
      {title: 'LE SPONSORING, SIMPLE ET RAPIDE',subtitle: 'Générez votre lien de parrainage et partagez-le par email, réseaux sociaux ou SMS en un clic.',image: 'assets/images/ads/3.jpg'},
      {title: 'ACCUMULEZ DES AVANTAGES 💳',subtitle: 'Transformez vos parrainages en réductions ou en cartes cadeaux sur vos marques préférées.',image: 'assets/images/ads/promotion.png'},
  ];
  public slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    dots: true,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 6000,
    speed: 500,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  };

  constructor() { }

  ngOnInit() { }



}
