import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { environment } from "../../environments/environment"
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseService } from '../services/firebase.service';
firebase.initializeApp(environment.firebase);
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {

  user:any;
  db: AngularFireDatabase;
  exists:any
  constructor(private router: Router, public afAuth: AngularFireAuth,private firebaseService: FirebaseService) {
   }

  ngOnInit() {
    try {
      firebase.auth().onAuthStateChanged(function(user){
        if(user)
          console.log(user)
        else
          console.log("no user")
      })
    } catch (err) {
      console.log(err)
    }
  }
  loginPage() { 
   this.router.navigate(['/login'])
  }
  async googleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.user = await firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user)
      return user
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log(error)
      return
      // ...
    });
    if(this.user){
      this.exists = await this.firebaseService.checkUserExists(this.user.email);
      console.log(this.exists)
      if(!this.exists)
        await this.firebaseService.AddUser(this.user)
      this.firebaseService.setUser(this.user)
      this.router.navigate(['/user'])
    }
    else
      console.log("error")

  }
  facebookSignIn() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user)
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
  signUpPage() {
    this.router.navigate(['/signup'])
  }

  signOut(){
    firebase.auth().signOut().then(function() {
      console.log("sign out")
    }).catch(function(error) {
      // An error happened.
    });
  }

}
