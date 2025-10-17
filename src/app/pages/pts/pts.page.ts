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
  IonBadge
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pts',
  templateUrl: './pts.page.html',
  styleUrls: ['./pts.page.scss'],
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
    RouterLink,
    IonBadge
  ]
})
export class PtsPage implements OnInit {

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.api.getPts().subscribe((resp: any) => {
      this.pts = resp.data;
    });
  }

  pts: any = [];

}
