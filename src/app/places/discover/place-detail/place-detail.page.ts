import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ActionSheetController, ModalController, NavController} from '@ionic/angular';
import {Place} from '../../place.model';
import {PlacesService} from '../../places.service';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }

      this.place = this.placesService.getPlace(paramMap.get('placeId'));
    });
  }

  onBookPlace() {
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // this.router.navigateByUrl('/places/tabs/discover');

    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [{
        text: 'Select Date', handler: () => {
          this.openBookingModal('select');
        }
      }, {
        text: 'Random Date', handler: () => {
          this.openBookingModal('random');
        }
      }, {text: 'Cancel', role: 'cancel'}]
    }).then(actionSheetElement => {
      actionSheetElement.present();
    });

  }

  openBookingModal(mode: 'select' | 'random') {
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place, selectedMode: mode
      }
    }).then(el => {
      el.present();
      return el.onDidDismiss();
    }).then((resultData) => {
      console.log({resultData});
      if (resultData.role === 'confirm') {
        console.log('Booked');
      }
    });
  }

}
