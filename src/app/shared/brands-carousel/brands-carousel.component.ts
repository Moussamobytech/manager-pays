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

  @Input('brands') brands: Array<Brand> = [];

  public config: SwiperConfigInterface = { };

  constructor( public apiService: ApiService) { }

  ngOnInit(): void {}

  ngAfterViewInit(){
    this.config = {
      slidesPerView: 4,
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
