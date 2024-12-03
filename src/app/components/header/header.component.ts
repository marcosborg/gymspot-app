import { Component, OnInit } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonImg, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonImg, IonBackButton],
})
export class HeaderComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }

}