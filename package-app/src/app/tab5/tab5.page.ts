import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonCardSubtitle,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonImg,
    CommonModule,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonButton,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class Tab5Page implements OnInit {

  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  access_token: any;
  packs: any = [];
  myPacks: any = [];
  segment: string = 'all';

  ngOnInit() {
    // 🔹 Usa paramMap para capturar corretamente o parâmetro
    this.segment = this.route.snapshot.paramMap.get('segment') || 'all';

    // 🔹 Escuta mudanças na URL para garantir reatividade
    this.route.paramMap.subscribe(params => {
      this.segment = params.get('segment') || 'all';
    });
  }


  ionViewWillEnter() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      this.preferences.checkName('access_token').then((resp: any) => {
        this.access_token = resp.value;
        if (this.access_token) {
          loading.present();
          this.api.packs().subscribe((resp: any) => {
            this.packs = resp.data;
            let data = {
              access_token: this.access_token
            }
            this.api.myPacks(data).subscribe((resp: any) => {
              this.myPacks = resp;
              loading.dismiss();
            });
          });
        }
      });
    });
  }

  goPack(pack_id: any) {
    this.router.navigate(['/pack', pack_id]);
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  handleRefresh(event: CustomEvent) {
    let data = {
      access_token: this.access_token
    }
    this.api.myPacks(data).subscribe((resp: any) => {
      this.myPacks = resp;
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  goLogin() {
    this.router.navigateByUrl('tabs/tab3');
  }

}