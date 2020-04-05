import {Injectable} from '@angular/core';
import {Booking} from './booking.model';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {delay, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService) {
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

    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(() => {
        this.bookingsSubject.next(this.bookingsSubject.value.concat(booking));
      })
    );
  }


  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookins => {
        this.bookingsSubject.next(bookins.filter(b => b.id !== bookingId));
      })
    );
  }

}
