import { Component, OnInit } from '@angular/core';
import { FirebaseAdminService } from 'src/app/services/firebase-admin.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  data = []
  loading = false;
  title = "heat map"
  type = "Map"
  column = ["Country", "Users"]
  constructor(private firebaseadmin: FirebaseAdminService) { }

  async ngOnInit() {
    google.charts.load('current', {
      'packages': ['geomap'],
      // Note: you will need to get a mapsApiKey for your project.
      // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
      'mapsApiKey': 'put the maps api key here'
    });
    this.data.push(this.column)
    await this.firebaseadmin.getTable().toPromise().then(table => {
      table[0].map(eachCountry => {
        this.data.push([eachCountry.country, String(eachCountry.country+"\n Users: "+eachCountry.users)])
      })
    })
    google.charts.setOnLoadCallback(drawRegionsMap=>{
      var data = google.visualization.arrayToDataTable(this.data);
      var options = {backgroundColor: '#FFFFFF'};

      var chart = new google.visualization.GeoChart(document.getElementById('geomap'));
      chart.draw(data, options);
    });
    this.loading = false
  }

}
