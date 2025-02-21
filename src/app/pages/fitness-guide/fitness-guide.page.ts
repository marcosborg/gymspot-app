import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonImg, IonInput, IonLabel, IonRow, IonSegment, IonSegmentButton, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-fitness-guide',
  templateUrl: './fitness-guide.page.html',
  styleUrls: ['./fitness-guide.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonCard,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonButton,
    IonInput,
    IonToolbar
  ]
})
export class FitnessGuidePage {

  constructor(
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private api: ApiService
  ) { }

  access_token: any;
  user: any;
  spot_id: any = 9;
  request: string = '';
  items: any;
  tab: string = 'guia_fitness';
  toon: boolean = true;
  video: boolean = false;
  video_link: string = 'https://gymspot.pt/storage/160/673af90ac542a_video.mp4';
  clickedItem: any = null;
  messages: any = [];
  newMessage: string = '';
  thread_id: any;

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
            this.api.getSpot(this.spot_id).subscribe((resp: any) => {
              this.items = resp.data.items;
              let equipment = '';
              this.items.forEach((element: any, index: number) => {
                equipment += element.name;
                if (index === this.items.length - 1) {
                  equipment += '.';
                } else {
                  equipment += ', ';
                }
              });
              let html = 'O meu nome é ' + this.user.name + '. Tenho ' + this.user.client.client_data.age + ' de idade. ';
              if (this.user.client.client_data.gender) {
                html += 'Sou do género ' + this.user.client.client_data.gender + '. ';
              } else {
                html += 'Não quero revelar o meu género.';
              }
              html += 'O meu objetivo principal é ' + this.user.client.client_data.primary_objective + ' e o meu nível de experiência com exercícios físicos é ' + this.user.client.client_data.fitness_level + '. ';
              html += 'Quero trabalhar ' + this.user.client.client_data.primary_type + ' e tenho disponibilidade para treinar ' + this.user.client.client_data.training_time + '. ';
              if (this.user.client.client_data.condition || this.user.client.client_data.condition_obs) {
                if (this.user.client.client_data.condition) {
                  html += 'Como condição de saúde tenho ' + this.user.client.client_data.condition + '. ';
                  if (this.user.client.client_data.condition_obs) {
                    html += ' Ainda tenho a segunte condição: ' + this.user.client.client_data.condition_obs + '.';
                  }
                } else {
                  html += 'Como condição de saúde tenho ' + this.user.client.client_data.condition_obs;
                }
              }
              html += 'O spot GymSpot onde me encontro, possui equipamento que permite realizar os seguintes treinos: ' + equipment + '. '
              html += 'Com base nestas informações quero que me prepares um treino de fitness para hoje, adequado à minha realidade e objetivos, e com base no quipamento e treinos que te passei e que se encontra disponível neste spot.';
              this.request = html;
              let data = {
                access_token: this.access_token,
                message: html
              }
              this.api.startConversation(data).subscribe((resp: any) => {
                this.thread_id = resp.data[0].thread_id;
                this.messages.push({ text: resp.data[0].content[0].text.value, sender: 'bot' });
                loading.dismiss();
              });
            });
          });
        } else {
          loading.dismiss();
        }
      });
    });
  }

  hideToon() {
    this.toon = !this.toon;
  }

  openVideo(original_url: any) {
    this.video = false;
    setTimeout(() => {
      this.video_link = original_url;
      this.video = true
    }, 500);
  }

  toggleOpacity(item: any) {
    this.clickedItem = item; // Define o item clicado
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.loadingController.create().then((loading) => {
        loading.present();
        this.messages.push({ text: this.newMessage, sender: 'me' });
        let data = {
          access_token: this.access_token,
          thread_id: this.thread_id,
          message: this.newMessage
        }
        this.api.sendMessage(data).subscribe((resp: any) => {
          this.messages.push({ text: resp.data[0].content[0].text.value, sender: 'bot' });
          loading.dismiss();
          this.newMessage = '';
        });
      });
    }
  }

}
