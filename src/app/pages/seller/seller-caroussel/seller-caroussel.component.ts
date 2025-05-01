import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SwiperPaginationInterface } from 'src/app/theme/components/swiper/swiper.interfaces';
import { SwiperOptions as SwiperConfigInterface } from 'swiper';

@Component({
  selector: 'app-seller-caroussel',
  templateUrl: './seller-caroussel.component.html',
  styleUrls: ['./seller-caroussel.component.scss'],
})
export class SellerCarousselComponent implements OnInit {
  @Input() sellerId: any;
  @Input() sellerBanners:any[];
  public config: SwiperConfigInterface = {};
  private pagination: SwiperPaginationInterface = {
    el: '.swiper-pagination',
    clickable: true
  };

  constructor(private router:Router) {
   }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.config = {
        slidesPerView: 1,
        spaceBetween: 0,
        keyboard: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: this.pagination,
        grabCursor: true,
        loop: true,
        preloadImages: true,
        lazy: true,
        autoplay: {
          disableOnInteraction: true,
        },
        speed: 1000,
        effect: 'fade',
      };
    }, 0);
  }


  routetoProduct(idLink: string){
    this.router.navigate(['sellers/'+this.sellerId],{fragment: idLink});
  }

}
