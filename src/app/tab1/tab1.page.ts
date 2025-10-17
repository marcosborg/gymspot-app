import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonModal, ModalController } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { register } from 'swiper/element/bundle';
import { addIcons } from 'ionicons';
import { addCircleOutline, location, logoEuro, peopleOutline, personOutline } from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';

register();

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    HeaderComponent,
    IonModal,
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1Page implements OnInit {
  constructor(
    private api: ApiService,
    public modal: ModalController,
    public router: Router
  ) {
    addIcons({
      personOutline,
      peopleOutline,
      addCircleOutline,
      logoEuro,
      location
    });
  }

  sliders: any = [];
  abouts: any = [];
  isModalOpen: any = false;
  text: string = '';
  image: string = '';
  galleries: any = [];
  locations: any = [];
  isGalleryOpen: any = false;
  personalTrainers: any = [];
  spots: any = [];
  packs: any = [];

  ngOnInit() {
    this.api.getSliders().subscribe((resp: any) => {
      this.sliders = resp.data;
    });
    this.api.getAbouts().subscribe((resp: any) => {
      this.abouts = resp.data;
    });
    this.api.getGalleries().subscribe((resp: any) => {
      this.galleries = resp.data;
    });
    this.api.getLocations().subscribe((resp: any) => {
      this.locations = resp.data;
    });
    this.api.getPts(10).subscribe((resp: any) => {
      this.personalTrainers = resp.data;
    });
    this.api.getSpots(10).subscribe((resp: any) => {
      this.spots = resp.data;
    });
    this.api.packs().subscribe((resp: any) => {
      this.packs = resp.data;
    });
  }

  showAbout(text: string, image: string) {
    this.isModalOpen = !this.isModalOpen;
    this.text = text;
    this.image = image;
  }

  cancel() {
    this.isModalOpen = false;
    this.isGalleryOpen = false;
  }

  openGallery(gallery_id: any) {
    this.isGalleryOpen = true;
  }

  goSpot(spot_id: any, soon: any) {
    if (soon == false) {
      this.router.navigateByUrl('/spot/' + spot_id);
    }
  }

  showPack(pack_id: any) {
    this.router.navigateByUrl('/pack/' + pack_id);
  }

}
