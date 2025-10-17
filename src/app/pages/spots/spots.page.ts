import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonImg,
  IonLabel,
  IonNote
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-spots',
  templateUrl: './spots.page.html',
  styleUrls: ['./spots.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonList,
    IonItem,
    IonAvatar,
    IonImg,
    IonLabel,
    IonNote,
  ]
})
export class SpotsPage implements OnInit {

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.api.getSpots().subscribe((resp: any) => {
      this.spots = resp.data;
    });
  }

  spots: any = [];

  goSpot(spot_id: any, soon: any) {
    if (soon == false) {
      this.router.navigateByUrl('spot/' + spot_id);
    }
  }

}
