import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  addSteps = false;
  steps = "";
  constructor() { }

  ngOnInit() {
  }

  toggleAddSteps() {
    this.addSteps = !this.addSteps;
  }

  submit() {
    console.log(this.steps);
  }
}
