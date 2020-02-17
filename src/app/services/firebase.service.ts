import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';

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
      'name': firstName + " " + lastName,
      'isAdmin': false
    })

    await user.sendEmailVerification();
  }

  /* Sign in */
  async SignIn(email: string, password: string) {
    var user = (await this.angularFireAuth.auth
      .signInWithEmailAndPassword(email, password)).user

    return user;
  }
  
  AddUser(userInfo){
    this.dbref.child(userInfo.uid).set({
      'uid':userInfo.uid,
      'email':userInfo.email,
      'stepCount':0,
      'name':userInfo.displayName,
      'photoURL':userInfo.photoURL
    })
  }

  SignOut() {
    this.angularFireAuth
      .auth
      .signOut();
  }

  updateStepCount(user: firebase.User, currentStepCount, addedStepCount) {
    return this.dbref.child(user.uid).update({ 'stepCount': +currentStepCount + +addedStepCount });
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

  async checkUserExists(email) {
    var exists = false;
    await this.dbref.once('value', async function (snapshot) {
      await snapshot.forEach(function (childSnapshot) {
        if (email == childSnapshot.val().email) {
          exists = true;
        }
      })
      console.log(exists)
    });
    return exists
  }
}
