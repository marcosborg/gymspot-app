import { Component } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonNote,
  IonLabel,
  LoadingController,
  IonButton,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { RouterLink } from '@angular/router';
import { formatDate } from '@angular/common';


registerLocaleData(localePt);

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderComponent,
    IonList,
    IonItem,
    IonNote,
    IonLabel,
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    RouterLink,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class Tab2Page {

  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService
  ) { }

  access_token: any;
  rented_slots: any = [];

  ionViewWillEnter() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.preferences.checkName('access_token').then((resp: any) => {
        loading.dismiss();
        this.access_token = resp.value;
        if (this.access_token) {
          this.getRentedSlots();
        } else {
          loading.dismiss();
        }
      });
    });
  }

  handleRefresh(event: CustomEvent) {
    this.getRentedSlots().then(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  getRentedSlots(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.loadingController.create().then((loading) => {
        loading.present();
        let data = {
          access_token: this.access_token
        }
        this.api.rentedSlots(data).subscribe((resp: any) => {
          loading.dismiss();
          this.rented_slots = resp.map((slot: any) => {
            const startDate = new Date(slot.start_date_time.replace(' ', 'T'));
            const endDate = new Date(slot.end_date_time.replace(' ', 'T'));

            return {
              ...slot,
              formattedStartDate: formatDate(startDate, 'shortDate', 'pt'),
              formattedStartTime: formatDate(startDate, 'HH:mm', 'pt'),
              formattedEndTime: formatDate(endDate, 'HH:mm', 'pt'),
            };
          });
          resolve();
        });
      });
    });
  }

}