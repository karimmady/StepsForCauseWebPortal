import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';
import { UserService } from '../services/user.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})

export class SignupFormComponent implements OnInit {
  loading = false;
  submittedForm = false;
  validCompanyInfo = false;
  companyName:any;
  totalSteps:any;


  signupForm = new FormGroup({
    companyName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]+')
    ]),
    totalSteps: new FormControl('', [
      Validators.required,
      Validators.pattern(/^-?(0|[1-9]\d*)?$/)
    ])
  });

  constructor(private userservice: UserService, private modalService: NzModalService, private router: Router) {

  }

  checkFormsValidity(): void {
    this.validCompanyInfo = this.signupForm.valid
  }

  ngOnInit() {

  }
  submitClicked() {
    this.submittedForm = true;
    this.companyName = this.signupForm.value.companyName;
    this.totalSteps = this.signupForm.value.totalSteps;
    this.userservice.setCompanySteps(this.companyName,this.totalSteps)
  }
}


