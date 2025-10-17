import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { IonContent, IonMenu } from '@ionic/angular/standalone';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.page.html',
  styleUrls: ['./cms.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CmsPage implements OnInit {

  content_page_id: any;
  content_page: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.content_page_id = this.route.snapshot.paramMap.get('content_page_id');
    this.api.getContentPage(this.content_page_id).subscribe((resp: any) => {
      this.content_page = resp.data;
    });
  }

}
