import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AuthService } from '../services/auth.service';
import { environment } from "../../environments/environment"
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseService } from '../services/firebase.service';
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {

  user: any;
  db: AngularFireDatabase;
  exists: any
  loggedin: boolean
  constructor(private router: Router, public afAuth: AngularFireAuth, private firebaseService: FirebaseService, private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.SignOut();
  }

  loginPage() {
    this.router.navigate(['/login'])
  }

  adminPage() {
    this.router.navigate(['/admin/login'])
  }

  async googleSignIn() {
    let signInComplete = await this.firebaseService.googleSignIn();

    if (signInComplete) {
      this.router.navigate(['/user']);
    } else {
      alert('auth/unexpected behavior' + '\n' +
        'An unexpected error occured, please contact someone in charge');
    }
  }

  async facebookSignIn() {
    let signInComplete = await this.firebaseService.facebookSignIn();

    if (signInComplete) {
      this.router.navigate(['/user']);
    } else {
      alert('auth/unexpected behavior' + '\n' +
        'An unexpected error occured, please contact someone in charge');
    }
  }

  signUpPage() {
    this.router.navigate(['/signup'])
  }

  signOut() {
    this.afAuth.auth.signOut().then(function () {
      console.log("sign out")
    }).catch(function (error) {
      console.log(error)
    });
  }

}
