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
    { title: '🎁 -10% dès ta première commande !', subtitle: 'Invite tes proches et gagne à chaque achat.', image: 'assets/images/ads/promotion.png' },
    { title: '🚚 Livraison partout, sans stress', subtitle: 'On te livre chez toi, peu importe la ville.', image: 'assets/images/ads/7.jpg' },
    { title: '✅ Plus fiable que les réseaux sociaux', subtitle: 'Tous nos vendeurs sont vérifiés. Livraison garantie ou remboursé.', image: 'assets/images/ads/6.jpg'},
    { title: '🛍️ Vends partout en Afrique', subtitle: 'Crée ta boutique en ligne en 2 minutes. Paiement & livraison intégrés.', image: '../../assets/images/ads/8.jpg' },
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
