import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronBackCircleOutline, chevronForwardCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-spot',
  templateUrl: './spot.page.html',
  styleUrls: ['./spot.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonImg,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SpotPage implements OnInit {

  spot: any;
  spot_id: any;
  month: any;
  isModalOpen: any = false;
  isCalendarOpen: any = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    addIcons({
      chevronForwardCircleOutline,
      chevronBackCircleOutline
    });
  }

  ngOnInit() {
    this.spot_id = this.route.snapshot.params['spot_id'];
    this.api.getSpot(this.spot_id).subscribe((resp: any) => {
      this.spot = resp.data;
    });
    this.api.getMonth().subscribe((resp: any) => {
      this.month = resp;
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  goDay(year: any, currentMonth: any, dayNumber: any) {
    this.isCalendarOpen = false;
    setTimeout(() => {
      this.router.navigateByUrl('day/' + this.spot_id + '/' + year + '/' + currentMonth + '/' + dayNumber);
    }, 500);
  }

  changeMonth(link: string) {
    this.api.changeMonth(link).subscribe((resp: any) => {
      this.month = resp;
    });
  }

}
