import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonAvatar,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
  IonToolbar,
  MenuController,
  IonButton,
  IonBadge,
  IonNote
} from '@ionic/angular/standalone';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonSplitPane,
    RouterLink,
    RouterLinkActive,
    IonContent,
    IonList,
    IonLabel,
    CommonModule,
    IonImg,
    IonHeader,
    IonToolbar,
    IonItem,
    IonAvatar,
    IonListHeader,
    IonButton,
    IonBadge,
    IonNote
  ],
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    private menu: MenuController,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      this.menu.close();
    });
    this.api.getPts(2).subscribe((resp: any) => {
      this.pts = resp.data;
    });
    this.api.getMenus().subscribe((resp: any) => {
      this.menus = resp.data;
    });
    this.api.getSpots(3).subscribe((resp: any) => {
      this.spots = resp.data;
    });
    this.api.getCategoryPages(1).subscribe((resp: any) => {
      this.utils = resp.data;
    });
  }

  menus: any = [];
  spots: any = [];
  pts: any = [];
  utils: any = [];

  goSpot(spot_id: any, soon: any) {
    if (soon == false) {
      this.router.navigateByUrl('spot/' + spot_id);
    }
  }

}
