import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, en_US, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { CommonModule } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpModule } from '@angular/http';
import { SignupFormComponent } from './signup-form/signup-form.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { LoginComponent } from './login/login.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreateUserComponent } from './admin/create-user/create-user.component';
import { CreateTeamComponent } from './admin/create-team/create-team.component';
import { AddStepsComponent } from './admin/add-steps/add-steps.component';
import { UsersComponent } from './admin/users/users.component';
import { CreateAdminComponent } from './admin/create-admin/create-admin.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import * as firebase from 'firebase';
import { TeamsComponent } from './admin/teams/teams.component';
import { CountdownComponent } from './countdown/countdown.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    SignupFormComponent,
    LandingPageComponent,
    AdminLoginComponent,
    LoginComponent,
    UserComponent,
    DashboardComponent,
    CreateUserComponent,
    CreateTeamComponent,
    AddStepsComponent,
    UsersComponent,
    CreateAdminComponent,
    UnauthorizedComponent,
    TeamsComponent,
    CountdownComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    CommonModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase, 'steps-for-cause'),
    AngularFireDatabaseModule,
  ],
  providers: [AngularFireAuth, , AngularFireDatabaseModule, AngularFireModule, AuthService, AuthGuard, { provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    firebase.initializeApp(environment.firebase);
  }
} 
