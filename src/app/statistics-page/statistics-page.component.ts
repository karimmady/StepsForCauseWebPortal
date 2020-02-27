import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
class User {
  constructor(
    public firstName,
    public lastName,
    public email,
    public password
  ) {}
}
@Component({
  selector: "app-statistics-page",
  templateUrl: "./statistics-page.component.html",
  styleUrls: ["./statistics-page.component.css"]
})
export class StatisticsPageComponent implements OnInit {
  totalSteps = 0;
  totalKM = 0;
  totalMoney = 0;
  public users: AngularFireList<User>;
  com: any;
  database: AngularFireDatabase;

  constructor(private router: Router, db: AngularFireDatabase) {
    this.database = db;
  }
  ngOnInit() {
    this.getTotal();
  }
  private getTotal() {
    window.setInterval(() => {
      this.users = this.database.list("/users");
      this.com = this.users.valueChanges();
      this.com.subscribe(async res => {
        this.totalSteps = 0;
        await res.map(u => {
          this.totalSteps += u.stepCount;
        });
        this.totalKM = parseInt((this.totalSteps * 0.0008).toString());
        this.totalMoney = parseInt((this.totalKM * 10).toString());
      })
    }, 1000);
  }
}
