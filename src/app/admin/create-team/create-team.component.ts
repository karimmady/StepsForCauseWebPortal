import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.css']
})
export class CreateTeamComponent implements OnInit {
  validCompanyInfo = false;

  teamForm = new FormGroup({
    teamName: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]+')
    ]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private firebaseadmin: FirebaseAdminService
  ) { }

  ngOnInit() {
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  checkFormsValidity(): void {
    this.validCompanyInfo = this.teamForm.valid
  }

  submitClicked() {
    this.firebaseadmin.createTeam(this.teamForm.value.teamName).subscribe(res => {
      alert("Team created");
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }
}
