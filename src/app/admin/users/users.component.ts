import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

class User {
  constructor(public name, public email, public password, public stepCount, public photo, public isAdmin) { }
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
  users: Array<firebase.User>;

  selectedId = "";
  selectedEmail = "";

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

  constructor(private db: AngularFireDatabase, private firebaseadmin: FirebaseAdminService,
    private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.dbref = this.db.list('/users')
    this.records = this.dbref.valueChanges();
    this.records.subscribe(res => {
      console.log(res)
      this.users = res;
      this.loading = false;
    })
  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }
  
  async updateUsers() {
    this.dbref = this.db.list('/users')
    this.records = this.dbref.valueChanges();
    this.records.subscribe(async res => {
      console.log(res)
      this.users = await res;
      this.loading = false;
    })
  }

  deleteUser() {
    this.loading = true;
    this.firebaseadmin.deleteUser(this.selectedId).subscribe(async res => {
      await this.updateUsers().then(() => {
        this.handleOkDelete();
        this.loading = false;
        alert("User deleted")
      })
    }, err => {
      this.handleCancelDelete();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  addSteps() {
    this.loading = true;
    this.firebaseadmin.addStepsToUser(this.selectedEmail, this.addStepsForm.value.steps).subscribe(res => {
      this.handleOkSteps();
      this.loading = false;
      alert("Steps added");
    }, err => {
      this.handleCancelSteps();
      this.loading = false;
      alert(err.error.code + "\n" + err.error.message)
    })
  }

  changeAdminStatus(email, isAdmin) {
    this.loading = true;
    this.firebaseadmin.changeAdminStatus(email, isAdmin).subscribe(async res => {
      await this.updateUsers().then(() => {
        this.loading = false;
        alert("User updated");
      })
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

  showModalDelete(id): void {
    this.selectedId = id;
    this.isVisibleDelete = true;
  }

  handleOkDelete(): void {
    this.isVisibleDelete = false;
  }

  handleCancelDelete(): void {
    console.log('Button cancel clicked!');
    this.isVisibleDelete = false;
  }

  showModalSteps(email): void {
    this.selectedEmail = email;
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
}
