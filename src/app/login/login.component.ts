import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { UserService } from '../services/user.service';
import { AngularFireDatabase } from 'angularfire2/database';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  constructor(private fb: FormBuilder,
    public router: Router, private firebase: FirebaseService, private userService: UserService
    ) { }

  ngOnInit() {
    this.validateForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password: [ null, [ Validators.required ] ],
      remember: [ true ]
    });
  }

  async login() {
    await this.firebase.SignIn(this.validateForm.value.userName, this.validateForm.value.password).then( res => {
      if(res.emailVerified){
        this.firebase.setUser(res);
        this.router.navigate(['/user'])
      }
      else
        alert("Please verify your email to login")

    }).catch(err => {
      alert(err);
    })
  }
}
