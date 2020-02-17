import { Component, OnInit } from '@angular/core';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  loading = true;
  teams: any;

  selectedTeam = "";
  selectedTeamUsers = [];
  stepsToAdd: Array<string>;

  isVisibleDelete = false;
  isVisibleMembers = false;

  constructor(private firebaseadmin: FirebaseAdminService, private authService: AuthService,
    private router: Router) { }

  async ngOnInit() {
    await this.getTeams();
  }

  async getTeams() {
    this.loading = true;
    this.firebaseadmin.getTeams().subscribe(res => {
      this.teams = res['data'];
      this.loading = false;
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  addStepsToUser(email, steps) {
    this.firebaseadmin.addStepsToUser(email, steps).subscribe(async res => {
      await this.getTeams();
      this.handleOkMembers();
      alert("Steps added")
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  removeUserFromTeam(email, teamName) {
    this.firebaseadmin.removeUserFromTeam(email, teamName).subscribe(async res => {
      await this.getTeams();
      this.handleOkMembers();
      alert("User removed");
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  deleteTeam() {
    this.firebaseadmin.deleteTeam(this.selectedTeam).subscribe(async res => {
      this.getTeams();
      this.handleOkDelete();
      alert("Team deleted");
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  showModalDelete(teamName): void {
    this.selectedTeam = teamName;
    this.isVisibleDelete = true;
  }

  handleOkDelete(): void {
    this.isVisibleDelete = false;
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  showModalMembers(users): void {
    this.selectedTeamUsers = users;
    this.stepsToAdd = new Array(users.length)
    this.isVisibleMembers = true;
  }

  handleOkMembers(): void {
    this.isVisibleMembers = false;
  }

  handleCancelMembers(): void {
    this.isVisibleMembers = false;
  }
}
