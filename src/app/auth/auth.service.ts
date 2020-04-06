import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly userId = 'xyz';
  private isUserAuthenticated = true;

  constructor() {
  }

  get userIsAuthenticated() {
    return this.isUserAuthenticated;
  }

  login() {
    this.isUserAuthenticated = true;
  }

  logout() {
    this.isUserAuthenticated = false;
  }
}
