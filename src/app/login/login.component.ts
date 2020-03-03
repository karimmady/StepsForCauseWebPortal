import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UserService } from '../services/user.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  constructor(private fb: FormBuilder,
    public router: Router, private firebase: FirebaseService, private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.SignOut();
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }

  async login() {
    await this.firebase.SignIn(this.validateForm.value.userName, this.validateForm.value.password).then(res => {
      if (res.emailVerified) {
        this.router.navigate(['/user'])
      } else {
        alert ("It seems like you have not yet verified your email")
      }
    }).catch(err => {
      alert(err);
    })
  }
}
