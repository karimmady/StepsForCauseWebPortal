import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import "rxjs";
import * as mime from 'mime-types'
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {
   }

  setCompanySteps(companyName, totalSteps): Promise<any> {
    return new Promise((resolve, reject) => {
      const reqHeaders: HttpHeaders = new HttpHeaders();
      reqHeaders.append('Content-Type', 'application/json');
      reqHeaders.append('Access-Control-Allow-Origin', '*');
      this.http.post("http://10.28.120.143:6200/setCompanySteps", {'companyName':companyName,"totalSteps":totalSteps})
      .subscribe((data) => resolve(data), err => reject(err));
    });
  }
}
