import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  userData: Observable<firebase.User>;
  dbref: firebase.database.Reference;
  user: any;
  private signUp = new BehaviorSubject(false);
  signUpStatus = this.signUp.asObservable();

  

  constructor(private angularFireAuth: AngularFireAuth) {
    this.userData = angularFireAuth.authState;
    this.dbref = firebase.database().ref('/users');
  }

  /* Sign up */
  async SignUp(email: string, password: string, firstName: string, lastName: string, stepCount: number) {
    var user = (await this.angularFireAuth.auth
      .createUserWithEmailAndPassword(email, password)).user;

    await this.dbref.child(user.uid).update({
      'uid': user.uid,
      'email': user.email,
      'stepCount': stepCount,
      'name': firstName + " " + lastName
    })

    await user.sendEmailVerification();
  }

  /* Sign in */
  async SignIn(email: string, password: string) {
    var user = (await this.angularFireAuth.auth
      .signInWithEmailAndPassword(email, password)).user
    
    return user;
  }

  SignOut() {
    this.angularFireAuth
      .auth
      .signOut();
  }

  changeSignUpStatus(flag: boolean) {
    console.log("Changing status", flag)
    this.signUp.next(flag)
  }

  setUser(user) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }
}
