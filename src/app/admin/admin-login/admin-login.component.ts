import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAdminService } from '../../services/firebase-admin.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  validateForm: FormGroup;
  dbref: firebase.database.Reference;

  constructor(private fb: FormBuilder, public router: Router, private _firebase: FirebaseService,
    private db: AngularFireDatabase, private authService: AuthService) {
    this.dbref = firebase.database().ref('/users');
  }

  ngOnInit() {
    this.authService.SignOut();
    this.validateForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }

  async login() {
    await this._firebase.SignIn(this.validateForm.value.email, this.validateForm.value.password).then(res => {
      this._firebase.setUser(res);
      try {
        this.dbref.orderByChild("email").equalTo(res.email).once("value", async (snapshot) => {
          if (snapshot.exists()) {
            const uid = Object.keys(snapshot.val())[0];
            localStorage.setItem('isAdmin', snapshot.val()[uid].isAdmin);
            if (snapshot.val()[uid].isAdmin) {
              this.router.navigate(['/admin/dashboard']);
              return;
            } else {
              alert("This user is not an admin")
            }
          }
        });
      } catch (err) {
        console.log("Current user has not been retreived yet which led to the following error")
        console.log(err)
      }
    }).catch(err => {
      alert(err);
    })
  }
}