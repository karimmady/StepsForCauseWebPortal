import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit {
  
  intervalId = 0;
  today = new Date();
  eventDate = new Date(this.today.getFullYear(), 5, 12);
  seconds = Math.round(this.eventDate.getTime() - this.today.getTime()) / 1000 ;
  days = 0;
  hours = 0;
  hoursLeft = 0;
  minutesLeft = 0;
  minutes = 0;
  remainingSeconds = 0;

  displayedDays = '';
  displayedHours = '';
  displayedMinutes = '';
  displayedSeconds = '';

  clearTimer() { clearInterval(this.intervalId); }

  ngOnInit()    { this.start(); }
  start() { this.countDown(); }

  
  private countDown() {
    this.clearTimer();
    this.intervalId = window.setInterval(() => {
      this.days        = Math.floor(this.seconds/24/60/60);
      this.hoursLeft   = Math.floor((this.seconds) - (this.days*86400));
      this.hours       = Math.floor(this.hoursLeft/3600);
      this.minutesLeft = Math.floor((this.hoursLeft) - (this.hours*3600));
      this.minutes     = Math.floor(this.minutesLeft/60);
      this.remainingSeconds = this.seconds % 60;
      function pad(n) {
        return (n < 10 ? "0" + n : n);
      }
      this.displayedDays = pad(this.days);
      this.displayedHours = pad(this.hours);
      this.displayedMinutes = pad(this.minutes);
      this.displayedSeconds = parseInt(pad(this.remainingSeconds)).toString();
      if (this.seconds == 0) {
        clearInterval(this.intervalId);
        document.getElementById('countdown').innerHTML = "Completed";
      } else {
        this.seconds--;
      }
    }, 1000);
  }

}
