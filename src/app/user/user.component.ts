import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: firebase.User;
  addSteps = false;
  steps: number;
  loading: boolean;

  constructor(private firebase: FirebaseService, private db: AngularFireDatabase) { }

  async ngOnInit() {
    this.loading = true;
    try {
      var fb_user = await this.firebase.getUser();

      this.db.list('users').valueChanges().subscribe(users => {
        users.map(async (u: firebase.User) => {
          if (u.uid === fb_user.uid) {
            this.user = u;
            this.loading = false;
            if (this.user["photo"] == undefined && this.user.photoURL) {
              await this.getBase64ImageFromURL(this.user.photoURL).subscribe(async base64data => {
                this.user["photo"] = ('data:image/jpg;base64,' + base64data);
              });
            }
            console.log(this.user)
          }
        })
      })
    }
    catch (err) {
      console.log("Current user has not been retreived yet which led to the following error")
      console.log(err)
    }
  }

  toggleAddSteps() {
    this.addSteps = !this.addSteps;
  }

  async submit() {
    this.loading = true;
    await this.firebase.updateStepCount(this.user, this.user["stepCount"], this.steps).then(res => {
      this.db.list('users').valueChanges().subscribe(users => {
        users.map(async (u: firebase.User) => {
          if (u.uid === this.user.uid) {
            this.user = u;
            if (this.user["photo"] == undefined && this.user.photoURL) {
              await this.getBase64ImageFromURL(this.user.photoURL).subscribe(async base64data => {
                this.user["photo"] = ('data:image/jpg;base64,' + base64data);
              });
            }
            this.loading = false;
            console.log(this.user)
          }
        })
      })
    });
  }

  getBase64ImageFromURL(url: string) {
    return Observable.create((observer: Observer<string>) => {
      let img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url; img.src = url;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
}
