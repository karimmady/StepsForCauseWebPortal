import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})

export class AdminLoginComponent implements OnInit {
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private _firebase: FirebaseService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.SignOut();
    this.validateForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }

  async login() {
    await this._firebase.SignIn(this.validateForm.value.email, this.validateForm.value.password).then(async res => {
      try {
        let user = await this._firebase.getDbUser();
        localStorage.setItem('isAdmin', user.isAdmin);

        if (user.isAdmin)
          this.router.navigate(['/admin/dashboard']);
        else
          alert('This user is not an admin');
      } catch (err) {
        console.log("Current user has not been retreived yet which led to the following error")
        console.log(err)
      }
    }).catch(err => {
      alert(err);
    })
  }
}