import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss'],
  standalone: true,
  imports: [
    IonFab,
    IonFabButton,
    IonIcon,
    CommonModule
  ]
})
export class CartButtonComponent implements OnInit {

  constructor(
    private router: Router,
    private preferences: PreferencesService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ cartOutline })
  }

  selected_slots: any = [];

  ngOnInit() {
    this.inicialize();
    setInterval(() => {
      this.inicialize();
    }, 5000);
  }

  inicialize() {
    this.preferences.checkName('selected_slots').then((resp: any) => {
      if (resp.value) {
        this.selected_slots = JSON.parse(resp.value);
      }
    })
  }

  goCart() {
    this.router.navigateByUrl('/cart');
  }

}
