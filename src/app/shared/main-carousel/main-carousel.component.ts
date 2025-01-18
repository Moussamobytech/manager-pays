import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SwiperConfigInterface, SwiperPaginationInterface } from '../../theme/components/swiper/swiper.module';

@Component({
  selector: 'app-main-carousel',
  templateUrl: './main-carousel.component.html',
  styleUrls: ['./main-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MainCarouselComponent implements OnInit {
  public slides = [
    { title: 'PROFITEZ DE -20% SUR VOS PREMIER ACHAT 🎉!', subtitle: 'Parainez vos amies et offrez-leur -20% sur leur premier achat. 🎁', image: 'assets/images/ads/promotion.png' },
    { title: 'PLUS FIABLE ET SÉCURISÉ QUE LES RÉSEAUX SOCIAUX', subtitle: 'Tous les vendeurs et produits sont vérifiés avant publication.', image: 'assets/images/ads/6.jpg'},
    { title: 'LIVRAISON POSSIBLE PARTOUT', subtitle: 'Vous n’avez pas de temps? Nous vous livrons à domicile.', image: 'assets/images/ads/7.jpg' },
    { title: 'VOUS ETES COMMERCANTS?', subtitle: 'Ouvrez votre boutique en ligne en créant un compte.', image: '../../assets/images/ads/8.jpg' },
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
