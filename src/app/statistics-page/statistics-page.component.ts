import { Component, OnInit } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { map } from "rxjs/operators";

@Component({
  selector: "app-statistics-page",
  templateUrl: "./statistics-page.component.html",
  styleUrls: ["./statistics-page.component.css"]
})

export class StatisticsPageComponent implements OnInit {
  totalSteps = 0;
  totalKM = 0;
  totalMoney = 0;
  totalStepsCol: AngularFirestoreCollection<any>;
  totalStepsVal: any;


  constructor(
    private afs: AngularFirestore,
  ) {
    // Define what collection userCol points to and let userColVals contain the observable which will eventually
    // contain the collection data
    this.totalStepsCol = this.afs.collection<any>('totalSteps');
    this.totalStepsVal = this.totalStepsCol.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        return { ...data };
      }))
    );

    this.totalStepsVal.forEach(s => {
      this.totalSteps = s[0].total;
      this.totalKM = this.totalSteps * 0.0008;
      this.totalMoney = this.totalKM * 10;
    })

  }

  ngOnInit() {
  }
}
