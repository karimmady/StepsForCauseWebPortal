import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';

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
  user: any;
  dbUser: any;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private _firestore: AngularFirestore,
  ) {
    this.userData = angularFireAuth.authState;
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

  async addUser(userInfo) {
    await this._firestore.collection('users').doc(userInfo.uid).set({
      'uid': userInfo.uid,
      'email': userInfo.email,
      'stepCount': 0,
      'name': userInfo.displayName,
      'photoURL': userInfo.photoURL
    });
  }

  SignOut() {
    this.angularFireAuth
      .auth
      .signOut();
  }

  // Function to update the stepCount of a user object in the db whether in users collection or members collection
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

  // Get the current firebase-auth-service user
  getCurrentUser() {
    this.user = this.angularFireAuth.auth.currentUser
    return this.user;
  }

  // Get the current user object in firestore whether in users or members collection
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
    let user = await this.getUserByEmail(email);
    if (user) {
      exists = true;
    }
    return exists;
  }

  // We perform all queries by id but the admin would not know the id of the user, therefore we retrieve the user
  // data by email whether in users or members collection
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

  // Get all teams so we can map the team id to a team name in the users table
  async getTeams() {
    let teams = {};

    (await this._firestore.collection('teams').get().toPromise()).docs.map(async team => {
      teams[team.id] = team.data().teamName;
      return teams;
    })

    return teams;
  }

  async googleSignIn(): Promise<boolean> {
    var provider = new firebase.auth.GoogleAuthProvider();
    let user = await this.angularFireAuth.auth.signInWithPopup(provider).then(result => {
      var u = result.user;
      return u;
    }).catch(err => {
      var errorCode = err.code;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert("This email logged in using different credentials")
      }
      return;
    });

    if (user) {
      console.log(user.photoURL)
      let exists = await this.checkUserExists(user.email);
      if (!exists)
        await this.addUser(user);
      return true;
    }
    return false;
  }

  async facebookSignIn(): Promise<boolean> {
    var provider = new firebase.auth.FacebookAuthProvider();
    let user = await this.angularFireAuth.auth.signInWithPopup(provider).then(result => {
      var u = result.user;
      return u;
    }).catch(err => {
      var errorCode = err.code;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert("This email logged in using different credentials")
      }
      return;
    })

    if (user) {
      console.log(user.photoURL)
      let exists = await this.checkUserExists(user.email);
      if (!exists)
        await this.addUser(user);
      return true;
    }
    return false;
  }
}