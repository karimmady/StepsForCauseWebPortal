import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup } from 'angularfire2/firestore';

export interface User {
  name: string;
  stepCount: boolean;
  email: string;
  team: string;
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  userData: Observable<firebase.User>;
  dbref: firebase.database.Reference;
  user: any;
  private signUp = new BehaviorSubject(false);
  signUpStatus = this.signUp.asObservable();
  dbUser: any;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private _firestore: AngularFirestore,
  ) {
    this.userData = angularFireAuth.authState;
    this.dbref = firebase.database().ref('/users');
  }

  /* Sign up */
  async SignUp(email: string, password: string, firstName: string, lastName: string, stepCount: number) {
    var user = (await this.angularFireAuth.auth
      .createUserWithEmailAndPassword(email, password)).user;

    await this._firestore.collection('users').doc(user.uid).set({
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

  AddUser(userInfo) {
    this.dbref.child(userInfo.uid).set({
      'uid': userInfo.uid,
      'email': userInfo.email,
      'stepCount': 0,
      'name': userInfo.displayName,
      'photoURL': userInfo.photoURL
    })
  }

  SignOut() {
    this.angularFireAuth
      .auth
      .signOut();
  }

  async updateStepCount(addedStepCount) {
    if (this.dbUser.team) {
      await this._firestore.collection('teams').doc(this.dbUser.team).collection('members').doc(this.dbUser.uid).update({
        'stepCount': +this.dbUser.stepCount + +addedStepCount
      })

      let team = await this._firestore.collection('teams').doc(this.dbUser.team).get().toPromise();

      await this._firestore.collection('teams').doc(this.dbUser.team).update({
        'totalSteps': +team.data().totalSteps + +addedStepCount
      });

      this.dbUser.stepCount += +addedStepCount;
    } else {
      await this._firestore.collection('users').doc(this.dbUser.uid).update({
        'stepCount': +this.dbUser.stepCount + +addedStepCount
      })
      this.dbUser.stepCount += +addedStepCount;
    }

    return this.dbUser;
  }

  changeSignUpStatus(flag: boolean) {
    console.log("Changing status", flag)
    this.signUp.next(flag)
  }

  getCurrentUser() {
    this.user = this.angularFireAuth.auth.currentUser
    return this.user;
  }

  async getDbUser() {
    var u = this.getCurrentUser();
    this.dbUser = (await this._firestore.collection('users').doc(u.uid).get().toPromise()).data()
    if (this.dbUser)
      return this.dbUser;
    else {
      (await this._firestore.collectionGroup('members', ref =>
        ref.where('uid', '==', u.uid)
      ).get().toPromise()).docs.forEach(user => {
        this.dbUser = user.data();
      });
      return this.dbUser;
    }
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

  async getUserByEmail(email) {
    var user;
    (await this._firestore.collection('users', ref =>
      ref.where('email', '==', email)
    ).get().toPromise()).docs.forEach(u => {
      user = u.data();
    })

    if (!user) {
      (await this._firestore.collectionGroup('members', ref =>
        ref.where('email', '==', email)
      ).get().toPromise()).docs.forEach(u => {
        user = u.data();
      })
    }
    return user;
  }

  async getTeams() {
    let teams = {};

    (await this._firestore.collection('teams').get().toPromise()).docs.map(async team => {
      teams[team.id] = team.data().teamName;
      return teams;
    })

    return teams;
  }

  test() {
    this._firestore.collection('users').valueChanges().subscribe(user => {
      console.log(user)
    })
  }
}
