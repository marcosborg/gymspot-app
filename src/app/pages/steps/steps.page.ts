import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonNote } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.page.html',
  styleUrls: ['./steps.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, IonList, IonItem, IonNote, IonLabel, IonImg]
})
export class StepsPage implements OnInit {

  constructor(
    private api: ApiService
  ) { }

  steps: any = [];

  ngOnInit() {
    this.api.getSteps().subscribe((resp: any) => {
      this.steps = resp.data;
    });
  }

}
