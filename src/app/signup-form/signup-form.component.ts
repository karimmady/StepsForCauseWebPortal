import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})

export class SignupFormComponent implements OnInit {
  loading = false;
  submittedForm = false;
  validCompanyInfo = false;


  signupForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]+')
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]+')
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern("^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$")
    ])
  });

  constructor(
    private router: Router,
    private firebase: FirebaseService
  ) { }

  checkFormsValidity(): void {
    this.validCompanyInfo = this.signupForm.valid
  }

  ngOnInit() {

  }

  async submitClicked() {
    await this.firebase.SignUp(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.firstName, this.signupForm.value.lastName, 0).then(res => {
      alert("Please verify your email to login")
      this.router.navigate(['/login'])
      this.router.navigate
    }).catch(err => {
      alert(err);
    })

  }
}


