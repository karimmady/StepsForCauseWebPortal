import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

export interface User {
  name: string;
  stepCount: number;
  email: string;
  team: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  isVisibleDelete = false;
  isVisibleSteps = false;
  isVisibleTeamAdd = false;
  isVisibleTeamRemove = false;
  public dbref: AngularFireList<User>;
  loading = true;
  records: any
  users: any[];
  teams: any;

  userRef: AngularFirestoreCollection<User>;
  usersCollect: Observable<User[]>;

  teamMembersRef: AngularFirestoreCollectionGroup<User>;
  teamMembersCollect: Observable<User[]>;

  selectedId = "";
  selectedTeamToAddSteps = "";
  indexToDelete: number;

  selectedEmailAddToTeam = "";
  selectedEmailRemoveFromTeam = "";
  selectedTeamNameRemove = "";

  addStepsForm = new FormGroup({
    steps: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]+')
    ]),
  });

  addToTeamForm = new FormGroup({
    teamName: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]+')
    ]),
  });

  constructor(
    private firebase: FirebaseService,
    private firebaseadmin: FirebaseAdminService,
    private authService: AuthService,
    private router: Router,
    private afs: AngularFirestore
  ) {
    this.userRef = this.afs.collection<User>('users');
    this.usersCollect = this.userRef.valueChanges();

    this.teamMembersRef = this.afs.collectionGroup<User>('members');
    this.teamMembersCollect = this.teamMembersRef.valueChanges();
  }

  async ngOnInit() {
    this.teams = await this.firebase.getTeams();
    this.updateUsers();
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  updateUsers() {
    let users = [];
    let teamMembers = [];
    this.usersCollect.subscribe(async usersInCollection => {
      this.teamMembersCollect.subscribe(async membersInCollection => {
        teamMembers = membersInCollection;
        users = usersInCollection;
        this.users = teamMembers.concat(users);
        this.loading = false;
      });
    }, err => {
      console.log(err)
    });
  }

  deleteUser() {
    this.loading = true;
    this.firebaseadmin.deleteUser(this.selectedId).subscribe(res => {
      this.handleOkDelete();
      // this.users.splice(this.indexToDelete, 1);
      this.loading = false;
      alert("User deleted")
    }, err => {
      this.handleCancelDelete();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  addSteps() {
    this.loading = true;
    this.firebaseadmin.addStepsToUser(this.selectedId, this.selectedTeamToAddSteps, this.addStepsForm.value.steps).subscribe(res => {
      this.handleOkSteps();
      this.loading = false;
      alert("Steps added");
    }, err => {
      this.handleCancelSteps();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  changeAdminStatus(id, team, isAdmin) {
    this.loading = true;
    this.firebaseadmin.changeAdminStatus(id, team, isAdmin).subscribe(res => {
      alert("User updated");
      this.loading = false;
      console.log(this.users)
    }, err => {
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  addUserToTeam() {
    this.loading = true;
    this.firebaseadmin.addUserToTeam(this.selectedEmailAddToTeam, this.addToTeamForm.value.teamName).subscribe(res => {
      this.handleOkTeamAdd();
      this.loading = false;
      alert("User added to team");
    }, err => {
      this.handleCancleTeamAdd();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  removeUserFromTeam() {
    this.loading = true;
    this.firebaseadmin.removeUserFromTeam(this.selectedEmailRemoveFromTeam, this.selectedTeamNameRemove).subscribe(res => {
      this.handleOkTeamRemove();
      this.loading = false;
      alert("User deleted from team");
    }, err => {
      this.handleCancleTeamRemove();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  showModalDelete(id, index): void {
    this.selectedId = id;
    this.indexToDelete = index;
    this.isVisibleDelete = true;
  }

  handleOkDelete(): void {
    this.isVisibleDelete = false;
  }

  handleCancelDelete(): void {
    console.log('Button cancel clicked!');
    this.isVisibleDelete = false;
  }

  showModalSteps(id, team): void {
    this.selectedId = id;
    this.selectedTeamToAddSteps = team;
    this.isVisibleSteps = true;
  }

  handleOkSteps(): void {
    this.isVisibleSteps = false;
  }

  handleCancelSteps(): void {
    console.log('Button cancel clicked!');
    this.isVisibleSteps = false;
  }

  showModalTeamAdd(email): void {
    this.selectedEmailAddToTeam = email;
    this.isVisibleTeamAdd = true;
  }

  handleOkTeamAdd(): void {
    this.isVisibleTeamAdd = false;
  }

  handleCancleTeamAdd(): void {
    this.isVisibleTeamAdd = false;
  }

  showModalTeamRemove(email, teamName): void {
    this.selectedEmailRemoveFromTeam = email;
    this.selectedTeamNameRemove = teamName;
    this.isVisibleTeamRemove = true;
  }

  handleOkTeamRemove(): void {
    this.isVisibleTeamRemove = false;
  }

  handleCancleTeamRemove(): void {
    this.isVisibleTeamRemove = false;
  }

  // async getTeam(teamID) {
  //   let teamName = await this.firebase.getTeam(teamID);
  //   this.teams[teamID] = teamName;
  //   console.log(teamName)
  // }
}
