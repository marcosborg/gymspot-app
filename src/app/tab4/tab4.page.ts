import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  LoadingController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    IonContent,
    IonImg,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    CommonModule,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    FormsModule
  ],
})
export class Tab4Page {
  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private router: Router,
    private alertController: AlertController
  ) { }

  access_token: any;
  user: any;
  toon: boolean = true;
  age: string = '';
  gender: string = '';
  primary_objective: string = '';
  primary_type: string = '';
  training_time: string = '';
  fitness_level: string = '';
  condition: string = '';
  condition_obs: string = '';
  training_frequency: string = '';

  ionViewWillEnter() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.preferences.checkName('access_token').then((resp: any) => {
        this.access_token = resp.value;
        if (this.access_token) {
          let data = {
            access_token: this.access_token
          }
          this.api.user(data).subscribe((resp) => {
            this.user = resp;
            if (this.user.client && this.user.client.client_data) {
              this.age = this.user.client.client_data.age;
              this.gender = this.user.client.client_data.gender;
              this.primary_objective = this.user.client.client_data.primary_objective;
              this.fitness_level = this.user.client.client_data.fitness_level;
              this.condition = this.user.client.client_data.condition;
              this.condition_obs = this.user.client.client_data.condition_obs;
              this.primary_type = this.user.client.client_data.primary_type;
              this.training_time = this.user.client.client_data.training_time;
              this.training_frequency = this.user.client.client_data.training_frequency;
            }
            loading.dismiss();
          });
        } else {
          loading.dismiss();
        }
      });
    });
  }

  goLogin() {
    this.router.navigateByUrl('tabs/tab3');
  }

  hideToon() {
    this.toon = !this.toon;
  }

  sendClientData() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        age: this.age,
        gender: this.gender,
        fitness_level: this.fitness_level,
        primary_objective: this.primary_objective,
        primary_type: this.primary_type,
        training_time: this.training_time,
        training_frequency: this.training_frequency,
        condition: this.condition,
        condition_obs: this.condition_obs,
      }
      if (this.user.client.client_data) {
        //UPDATE
        this.api.updateClientData(data).subscribe(() => {
          loading.dismiss();
          this.router.navigateByUrl('fitness-guide');
        }, (err) => {
          loading.dismiss();
          let errors = err.error.errors;
          let errorMessages = '';
          for (const field in errors) {
            if (errors.hasOwnProperty(field)) {
              errors[field].forEach((message: string) => {
                errorMessages += `${message}. `;
              });
            }
          }
          this.alertController.create({
            header: 'Erro de validação',
            message: errorMessages,
          }).then((alert) => {
            alert.present();
          });
        });
      } else {
        //CREATE
        this.api.createClientData(data).subscribe(() => {
          loading.dismiss();
          this.router.navigateByUrl('fitness-guide');
        }, (err) => {
          loading.dismiss();
          let errors = err.error.errors;
          let errorMessages = '';
          for (const field in errors) {
            if (errors.hasOwnProperty(field)) {
              errors[field].forEach((message: string) => {
                errorMessages += `${message}. `;
              });
            }
          }
          this.alertController.create({
            header: 'Erro de validação',
            message: errorMessages,
          }).then((alert) => {
            alert.present();
          });
        });
      }
    });
  }
  
}
