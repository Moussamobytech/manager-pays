import { Component, Input } from '@angular/core';
import { SwiperConfigInterface } from '../../theme/components/swiper/swiper.module';
import { Brand } from 'src/app/app.models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-brands-carousel',
  templateUrl: './brands-carousel.component.html',
  styleUrls: ['./brands-carousel.component.scss']
})
export class BrandsCarouselComponent {

  brands: Array<Brand> = [
    { logo: "https://storage.googleapis.com/fidelity-e0007.appspot.com/2e11feeab444496fb9298a486801bce4.png"},
    { logo: "https://storage.googleapis.com/fidelity-e0007.appspot.com/5e5de7d9ef024e9090167ae060fbc3e8.png" },
    { logo: "https://storage.googleapis.com/fidelity-e0007.appspot.com/519337814c1d4bbeb2c9c000f6ef3a43.png" },
    { logo: "https://storage.googleapis.com/fidelity-e0007.appspot.com/c42ca8d48d34487a9aa9251fb882af9a.png" }
  ];

  public config: SwiperConfigInterface = { };

  constructor( public apiService: ApiService) { }

  ngOnInit(): void {}

  ngAfterViewInit(){
    this.config = {
      slidesPerView: 7,
      spaceBetween: 1,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: true,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false
      },
      speed: 500,
      effect: "slide",
      breakpoints: {
        240: {
          slidesPerView: 1
        },
        480: {
          slidesPerView: 2
        },
        600: {
          slidesPerView: 3
        },
        960: {
          slidesPerView: 4
        },
        1280: {
          slidesPerView: 5
        },
        1500: {
          slidesPerView: 6
        }
      }
    }
  }


}
