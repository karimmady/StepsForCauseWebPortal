import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs'
import { _ } from 'underscore';

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
  loading = true;
  users = [];
  teams: any;

  userCol: AngularFirestoreCollection<any>;
  userColVals: any;

  teamCol: AngularFirestoreCollectionGroup<any>;
  teamColVals: any;

  selectedId = "";
  selectedTeamToAddSteps = "";

  selectedTeamIDRemove = "";

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
  ) { }

  async ngOnInit() {
    this.teams = await this.firebase.getTeams();
    await this.updateUsers();
    this.loading = false;
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }

  /** This function is automatically called because of the subscription */
  async updateUsers() {
    // Define what collection userCol points to and let userColVals contain the observable which will eventually
    // contain the collection data
    this.userCol = this.afs.collection<any>('users');
    this.userColVals = this.userCol.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        return { ...data };
      }))
    );

    // Define what collectionGrou teamCol points to and let teamColVals contain the observable which will eventually
    // contain the collectionGroup data
    this.teamCol = this.afs.collectionGroup<any>('members');
    this.teamColVals = this.teamCol.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        return { ...data };
      }))
    );

    // Combine the userColVals and teamColVals observables together and store their lates values as a single array
    // in this.users
    combineLatest(this.userColVals, this.teamColVals).pipe(
      map(([x, y]) => x.concat(y) as Array<any>)
    ).subscribe(users => {
      this.users = users as [];
    })
  }

  deleteUser() {
    this.loading = true;
    this.firebaseadmin.deleteUser(this.selectedId).subscribe(res => {
      this.handleOkDelete();
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
    }, err => {
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  addUserToTeam() {
    this.loading = true;
    let teamID = (_.invert(this.teams))[this.addToTeamForm.value.teamName];
    this.firebaseadmin.addUserToTeam(this.selectedId, teamID).subscribe(res => {
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
    this.firebaseadmin.removeUserFromTeam(this.selectedId, this.selectedTeamIDRemove).subscribe(res => {
      this.handleOkTeamRemove();
      this.loading = false;
      alert("User deleted from team");
    }, err => {
      this.handleCancleTeamRemove();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  showModalDelete(id): void {
    this.selectedId = id;
    this.isVisibleDelete = true;
  }

  handleOkDelete(): void {
    this.isVisibleDelete = false;
  }

  handleCancelDelete(): void {
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
    this.isVisibleSteps = false;
  }

  showModalTeamAdd(id): void {
    this.selectedId = id;
    this.isVisibleTeamAdd = true;
  }

  handleOkTeamAdd(): void {
    this.isVisibleTeamAdd = false;
  }

  handleCancleTeamAdd(): void {
    this.isVisibleTeamAdd = false;
  }

  showModalTeamRemove(id, team): void {
    this.selectedId = id;
    this.selectedTeamIDRemove = team;
    this.isVisibleTeamRemove = true;
  }

  handleOkTeamRemove(): void {
    this.isVisibleTeamRemove = false;
  }

  handleCancleTeamRemove(): void {
    this.isVisibleTeamRemove = false;
  }
}
