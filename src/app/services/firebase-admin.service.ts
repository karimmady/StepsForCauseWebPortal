import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAdminService {

  userData: Observable<firebase.User>;
  dbref: firebase.database.Reference;
  user: any;
  private signUp = new BehaviorSubject(false);
  signUpStatus = this.signUp.asObservable();

  constructor(private http: HttpClient) { }

  createAdmin(email: string, password: string, firstName: string, lastName: string, stepCount: number) {
    var body = {
      "email": email,
      "password": password,
      "firstName": firstName,
      "lastName": lastName,
      "stepCount": stepCount
    }
    return this.http.post("http://localhost:3000/admins", body);
  }

  createUser(email: string, password: string, firstName: string, lastName: string, stepCount: number) {
    var body = {
      "email": email,
      "password": password,
      "firstName": firstName,
      "lastName": lastName,
      "stepCount": stepCount
    }
    return this.http.post("http://localhost:3000/users", body);
  }

  addStepsToUser(id, team, addedStepCount: number) {
    var body = {
      "id": id,
      "team": team,
      "addedStepCount": addedStepCount
    }
    return this.http.put("http://localhost:3000/users", body);
  }

  getUsers() {
    return this.http.get("http://localhost:3000/users");
  }

  deleteUser(id) {
    return this.http.delete(`http://localhost:3000/users?id=${id}`);
  }

  createTeam(teamName: string) {
    var body = {
      "teamName": teamName
    }
    return this.http.post("http://localhost:3000/teams", body);
  }

  addUserToTeam(email: string, teamName: string) {
    var body = {
      "email": email,
      "teamName": teamName
    }
    return this.http.put("http://localhost:3000/teams/add-user", body);
  }

  removeUserFromTeam(email: string, teamName: string) {
    var body = {
      "email": email,
      "teamName": teamName
    }
    return this.http.put("http://localhost:3000/teams/remove-user", body);
  }

  getTeams() {
    return this.http.get("http://localhost:3000/teams");
  }

  deleteTeam(teamName) {
    return this.http.delete(`http://localhost:3000/teams?teamName=${teamName}`);
  }

  changeAdminStatus(id, team, isAdmin: boolean) {
    var body = {
      "id": id,
      "team": team,
      "isAdmin": isAdmin
    }
    return this.http.put("http://localhost:3000/users/change-isAdmin", body);
  }
}
