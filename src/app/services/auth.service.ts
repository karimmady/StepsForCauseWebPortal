import { Injectable, NgZone } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any;
  dbref: firebase.database.Reference;

  constructor(
    public auth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    // Setting logged in user in localstorage else null
    this.auth.authState.subscribe(async user => {
      this.dbref = firebase.database().ref('/users');
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    return ((user !== null) && (isAdmin)) ? true : false;
  }

  // Sign out 
  SignOut() {
    return this.auth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
    })
  }
}