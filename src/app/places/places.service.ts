import {Injectable} from '@angular/core';
import {Place} from './place.model';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';


interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesSubject = new BehaviorSubject<Place[]>([]);

  constructor(private  authService: AuthService, private http: HttpClient) {
  }

  get places(): Observable<Place[]> {
    return this.placesSubject.asObservable();
  }

  getPlace(id: string): Observable<Place> {
    return this.http.get<PlaceData>(`https://ionic-places-92bbf.firebaseio.com/offered-places/${id}.json`)
      .pipe(
        map(resData => {
          return new Place(
            id,
            resData.title,
            resData.description,
            resData.imageUrl,
            resData.price,
            new Date(resData.availableFrom),
            new Date(resData.availableTo),
            resData.userId
          );
        }),
        tap(resData => {
          console.log({resData});
        }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];

    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length === 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];

        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId);
        return this.http.put(`https://ionic-places-92bbf.firebaseio.com/offered-places/${placeId}.json`, {
          ...updatedPlaces[updatedPlaceIndex],
          id: null
        });
      }),
      tap(() => {
        this.placesSubject.next(updatedPlaces);
      })
    );
  }

  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>('https://ionic-places-92bbf.firebaseio.com/offered-places.json')
      .pipe(
        map(resData => {
          return Object.keys(resData).map(id => {
            const placeRawData = resData[id];
            return new Place(
              id,
              placeRawData.title,
              placeRawData.description,
              placeRawData.imageUrl,
              placeRawData.price,
              new Date(placeRawData.availableFrom),
              new Date(placeRawData.availableTo),
              placeRawData.userId);
          });
        }),
        tap(data => {
          this.placesSubject.next(data);
        })
      );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const place = new Place(
      Math.random().toString(),
      title,
      description,
      'https://i.pinimg.com/originals/65/8f/77/658f77b9b527f89922ba996560a3e2b0.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );

    return this.http.post<{ name: string }>('https://ionic-places-92bbf.firebaseio.com/offered-places.json', {...place, id: null}).pipe(
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        place.id = generatedId;
        this.placesSubject.next(places.concat(place));
      })
    );
  }
}
