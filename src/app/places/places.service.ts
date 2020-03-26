import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places: Place[] = [
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New Yourk City.',
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg',
      149.99
    ),
    new Place(
      'p2',
      'L\'Amour Toujours',
      'A romantic place in Paris!',
      'https://miro.medium.com/max/4096/1*t-nXIcaD3oP6CS4ydXV1xw.jpeg',
      189.99
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://i.pinimg.com/originals/65/8f/77/658f77b9b527f89922ba996560a3e2b0.jpg',
      99.99
    )
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string): Place {
    return { ...this.places.find(place => place.id === id) };
  }
}
