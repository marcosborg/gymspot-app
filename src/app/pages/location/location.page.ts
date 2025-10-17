import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonIcon, IonImg, IonButton } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { LocationsComponent } from 'src/app/components/locations/locations.component';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { callOutline, locationOutline, mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    HeaderComponent,
    CommonModule,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    LocationsComponent,
    FormsModule,
    IonIcon,
    IonButton
  ]
})
export class LocationPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public router: Router
  ) {
    addIcons({ locationOutline, callOutline, mailOutline });
  }

  location_id: any;
  location: any;

  ngOnInit() {
    addIcons({
      locationOutline,
      callOutline,
      mailOutline
    });
    this.location_id = this.route.snapshot.params['location_id'];
    this.api.getLocation(this.location_id).subscribe((resp: any) => {
      this.location = resp.data;
    });
  }

  goSpot(spot_id: any, soon: any) {
    if (soon != true) {
      this.router.navigateByUrl('spot/' + spot_id);
    }
  }

}
