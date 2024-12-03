import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  LoadingController,
  IonThumbnail,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonButtons,
  AlertController,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { addIcons } from 'ionicons';
import { cameraOutline, saveOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-personal-trainer-area',
  templateUrl: './personal-trainer-area.page.html',
  styleUrls: ['./personal-trainer-area.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonThumbnail,
    IonLabel,
    IonButton,
    IonIcon,
    IonModal,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
  ]
})
export class PersonalTrainerAreaPage {

  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ cameraOutline, saveOutline });
  }

  access_token: any;
  spots: any = [];
  user: any;
  personal_trainer: any;
  isModalOpen = false;
  profile_photo: any = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  other_photos: any = [];

  ionViewWillEnter() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.getSpots().subscribe((resp: any) => {
        this.spots = resp.data;
        this.preferences.checkName('access_token').then((resp: any) => {
          this.access_token = resp.value;
          let data = {
            access_token: this.access_token
          }
          this.api.user(data).subscribe((resp: any) => {
            loading.dismiss();
            this.user = resp;
            if (this.user.personal_trainer) {
              this.personal_trainer = this.user.personal_trainer;
              let spots = this.personal_trainer.spots;
              let spotsArray: any = [];
              spots.forEach((element: any) => {
                spotsArray.push(element.id);
              });
              if (this.personal_trainer.photos.length > 0) {
                this.profile_photo = this.personal_trainer.photos[0].original_url;
                this.other_photos = this.personal_trainer.photos.slice(1).map((photo: any) => photo);
              }
              this.personal_trainer.spots = spotsArray;
            } else {
              this.personal_trainer = {
                name: this.user.name,
                email: this.user.email,
                phone: "",
                facebook: "",
                instagram: "",
                linkedin: "",
                tiktok: "",
                description: "",
                price: "",
                professional_certificate: "",
                spots: [],
                expiration: "",
                certificate_type: "",
                user_id: this.user.id,
              }
            }
          });
        });
      });
    });
  }

  updateProfessionalData() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        personal_trainer: this.personal_trainer
      }
      this.api.updateProfessionalData(data).subscribe((resp: any) => {
        loading.dismiss();
        this.inicialize();
        if (resp.photos.length == 0) {
          this.isModalOpen = true;
        }
      }, (err) => {
        console.log(err);
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
          buttons: [
            {
              text: 'Tentar novamente',
              role: 'cancel'
            }
          ]
        }).then((alert) => {
          alert.present();
        });
      });
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  onWillDismiss() {
    this.inicialize();
  }

  profilePhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      width: 800
    });

    this.profile_photo = 'data:image/jpeg;base64,' + image.base64String;
  };

  otherPhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      width: 800
    });
    let photo = 'data:image/jpeg;base64,' + image.base64String;
    let data = {
      access_token: this.access_token,
      request: {
        personal_trainer_id: this.personal_trainer.id,
        photo: photo
      }
    }
    this.api.saveOtherPhoto(data).subscribe((resp: any) => {
      this.inicialize();
    });
  }

  savePhoto() {
    let data = {
      access_token: this.access_token,
      request: {
        personal_trainer_id: this.personal_trainer.id,
        profile_photo: this.profile_photo
      }
    }
    this.api.saveProfilePhoto(data).subscribe(() => {
      this.isModalOpen = false;
    });
  }

  deletePhoto(photo_id: any) {
    this.actionSheetCtrl.create({
      header: 'Deseja apagar a photo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Apagar',
          handler: () => {
            let data = {
              access_token: this.access_token,
              photo_id: photo_id
            }
            this.api.deletePhoto(data).subscribe((resp) => {
              this.inicialize();
            });
          }
        }
      ]
    }).then((action) => {
      action.present();
    });
  }

}
