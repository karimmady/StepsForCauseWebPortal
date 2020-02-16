import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
class User {
  constructor(public firstName, public lastName, public email, public password) { }
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  companyName: any;
  totalSteps = 0;
  totalKM = 0;
  totalMoney = 0;
  public users: AngularFireList<User>;
  com: any;

  flag = false;
  constructor(private authService: AuthService, private router: Router, db: AngularFireDatabase) {
    this.users = db.list('/users')
    this.com = this.users.valueChanges();
    this.com.subscribe(async res => {
      this.totalSteps = 0;
      await res.map(u => {
        this.totalSteps += u.stepCount;
      })
      this.totalKM = this.totalSteps * 0.0008;
      this.totalMoney = this.totalKM * 10;
      console.log(this.totalSteps)
    })
  }

  ngOnInit() {

  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }
}
