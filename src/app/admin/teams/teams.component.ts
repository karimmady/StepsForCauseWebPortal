import { Component, OnInit } from '@angular/core';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { _ } from 'underscore';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  loading = true;
  teams: any;
  teamIDs = {};

  selectedTeam = "";
  selectedTeamUsers = [];
  stepsToAdd: Array<string>;

  isVisibleDelete = false;
  isVisibleMembers = false;

  constructor(
    private firebaseadmin: FirebaseAdminService,
    private authService: AuthService,
    private router: Router,
    private firebase: FirebaseService
  ) { }

  async ngOnInit() {
    this.teamIDs = await this.firebase.getTeams();
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

  addStepsToUser(id, team, steps) {
    this.firebaseadmin.addStepsToUser(id, team, steps).subscribe(async res => {
      this.handleOkMembers();
      alert("Steps added")
      await this.getTeams()
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  removeUserFromTeam(id, team) {
    this.firebaseadmin.removeUserFromTeam(id, team).subscribe(async res => {
      this.handleOkMembers();
      alert("User removed");
      await this.getTeams();
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  deleteTeam() {
    let teamID = (_.invert(this.teamIDs))[this.selectedTeam];
    this.firebaseadmin.deleteTeam(teamID).subscribe(async res => {
      this.handleOkDelete();
      alert("Team deleted");
      await this.getTeams();
    }, err => {
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  showModalDelete(team): void {
    this.selectedTeam = team;
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
