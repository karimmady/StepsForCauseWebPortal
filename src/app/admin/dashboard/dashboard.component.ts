import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  totalSteps = 0;
  totalKM = 0;
  totalMoney = 0;
  users = [];
  userCol: AngularFirestoreCollection<any>;
  userColVals: any;

  teamCol: AngularFirestoreCollectionGroup<any>;
  teamColVals: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private afs: AngularFirestore
  ) {
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
    ).subscribe(async users => {
      this.users = users as [];

      let total = await this.users.map(u => {
        this.totalSteps += u.stepCount;
      });
      await Promise.all(total);

      this.totalKM = this.totalSteps * 0.0008;
      this.totalMoney = this.totalKM * 10;
    })
  }

  ngOnInit() {

  }

  logout() {
    this.authService.SignOut();
    this.router.navigate(['']);
  }
}
