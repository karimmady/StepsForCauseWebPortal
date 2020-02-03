import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
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
class Company{
  constructor(public Name,public totalSteps) { }
}

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
  public companies: AngularFireList<Company>;
  com:any;

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

  constructor(private userservice: UserService, private modalService: NzModalService, private router: Router, db: AngularFireDatabase) {
    this.companies = db.list('/teams')
    this.com = this.companies.valueChanges();
    this.com.subscribe(res=> console.log(res))
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
    this.companies.push({Name:this.companyName, totalSteps:this.totalSteps})
    // this.userservice.setCompanySteps(this.companyName,this.totalSteps)
  }
}


