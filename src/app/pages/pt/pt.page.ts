import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonBadge,
  IonNote
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logoFacebook, logoInstagram, logoLinkedin, logoTiktok, mailOutline, callOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pt',
  templateUrl: './pt.page.html',
  styleUrls: ['./pt.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonBadge,
    IonNote
  ]
})
export class PtPage implements OnInit {

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
      addIcons({logoFacebook,logoLinkedin,logoInstagram,logoTiktok,mailOutline,callOutline}); }

  ngOnInit() {
    addIcons({
      logoFacebook,
      logoInstagram,
      logoLinkedin,
      logoTiktok,
      mailOutline,
      callOutline
    });
    this.api.getPt(this.personal_trainer_id).subscribe((resp: any) => {
      this.pt = resp.data;
    });
  }

  pt: any;
  personal_trainer_id: any = this.route.snapshot.params['personal_trainer_id'];

  goSpot(spot_id: any) {
    this.router.navigateByUrl('spot/' + spot_id);
  }

}
