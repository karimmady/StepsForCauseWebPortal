import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-steps',
  templateUrl: './add-steps.component.html',
  styleUrls: ['./add-steps.component.css']
})
export class AddStepsComponent implements OnInit {

  validCompanyInfo = false;

  addStepsForm = new FormGroup({
    entity: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]+')
    ]),
    steps: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]+')
    ]),
  });

  constructor(private firebaseadmin: FirebaseAdminService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  checkFormsValidity(): void {
    this.validCompanyInfo = this.addStepsForm.valid
  }

  submitClicked() {
    this.firebaseadmin.addStepsToUser(this.addStepsForm.value.entity, this.addStepsForm.value.steps).subscribe(res => {
      alert("Steps added");
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }
}
