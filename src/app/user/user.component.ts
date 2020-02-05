import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: firebase.User;

  constructor(private firebase: FirebaseService, private db: AngularFireDatabase) { }

  async ngOnInit() {
    var fb_user = await this.firebase.getUser();

    this.db.list('users').valueChanges().subscribe(users => {
      users.map(async (u: firebase.User) => {
        if (u.uid === fb_user.uid) {
          this.user = u;
          console.log(this.user)
        }
      })
    })
  }

}
