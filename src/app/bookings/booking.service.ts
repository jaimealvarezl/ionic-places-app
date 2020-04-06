import {Injectable} from '@angular/core';
import {Booking} from './booking.model';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

interface BookingData {
  placeId: string;
  userId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  guestNumber: number;
  bookFrom: string;
  bookTo: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {
  }

  get bookings() {
    return this.bookingsSubject.asObservable();
  }

  addBooking(placeId: string,
             placeTitle: string,
             placeImg: string,
             firstName: string,
             lastName: string,
             guestNumber: null,
             dateFrom: Date,
             dateTo: Date) {

    let generatedId: string;
    const booking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImg,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );


    return this.http.post<{ name: string }>('https://ionic-places-92bbf.firebaseio.com/bookings.json', {...booking, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          booking.id = generatedId;
          this.bookingsSubject.next(bookings.concat(booking));
        }));
  }

  fetchBookings() {
    return this.http.get<{ [key: string]: BookingData }>(`https://ionic-places-92bbf.firebaseio.com/bookings.json`, {
      params: {orderBy: '"userId"', equalTo: `"${this.authService.userId}"`}
    }).pipe(
      map(resData => {
        return Object.entries(resData)
          .map(([bookingId, bookingData]) => {
            return new Booking(
              bookingId,
              bookingData.placeId,
              bookingData.userId,
              bookingData.placeTitle,
              bookingData.placeImage,
              bookingData.firstName,
              bookingData.lastName,
              bookingData.guestNumber,
              new Date(bookingData.bookFrom),
              new Date(bookingData.bookTo)
            );
          });
      }),
      tap(bookings => {
        this.bookingsSubject.next(bookings);
      })
    );
  }


  cancelBooking(bookingId: string) {
    return this.http.delete(`https://ionic-places-92bbf.firebaseio.com/bookings/${bookingId}.json`)
      .pipe(
        switchMap(() => this.bookings),
        take(1),
        tap(bookings => this.bookingsSubject.next(bookings.filter(b => b.id !== bookingId))),
      );
  }

}
