import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PlacesService} from '../../places.service';
import {Place} from '../../place.model';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  isLoading = false;
  place: Place;
  placeId: string;
  form: FormGroup;
  private placeSub: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private  alertCtrl: AlertController
  ) {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.placeId = paramMap.get('placeId');
      this.isLoading = true;

      this.placeSub = this.placesService
        .getPlace(this.placeId)
        .subscribe(place => {
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              description: new FormControl(this.place.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)]
              }),
            });

            this.isLoading = false;
          },
          error => {
            this.alertCtrl.create({
              header: 'An error occurred!',
              message: 'Place could not be fetched. Please try again later.',
              buttons: [{
                text: 'Okay', handler: () => {
                  this.router.navigate(['/places/tabs/offers']);
                }
              }]
            }).then(alertEl => {
              alertEl.present();
            });
          });
    });
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    const {title, description} = this.form.value;

    this.loadingCtrl.create({message: `Updating ${this.place.title}...`}).then(loadingElement => {
      loadingElement.present();
      this.placesService.updatePlace(this.place.id, title, description)
        .subscribe(() => {
          loadingElement.dismiss();
          this.router.navigate(['/places/tabs/offers']);
        });
    });
  }
}
