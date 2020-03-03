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
    var provider = new firebase.auth.GoogleAuthProvider();
    this.user = await firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential["accessToken"];
      // The signed-in user info.
      var user = result.user;
      return user
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert("This email logged in using different credentials")
      }
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log(error)
      return
      // ...
    });
    if (this.user) {
      this.exists = await this.firebaseService.checkUserExists(this.user.email);
      if (!this.exists)
        await this.firebaseService.AddUser(this.user)
      // this.firebaseService.setUser(this.user)
      this.router.navigate(['/user'])
    }
    else
      console.log("error")

  }

  async facebookSignIn() {
    var provider = new firebase.auth.FacebookAuthProvider();
    this.user = await firebase.auth().signInWithPopup(provider).then(function (result) {
      var token = result.credential["accessToken"];
      var user = result.user;
      return user;
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert("This email logged in using different credentials")
      }
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      return
    });
    if (this.user) {
      this.exists = await this.firebaseService.checkUserExists(this.user.email);
      if (!this.exists)
        await this.firebaseService.AddUser(this.user)
      // this.firebaseService.setUser(this.user)
      this.router.navigate(['/user'])
    }
    else
      console.log("error")

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
