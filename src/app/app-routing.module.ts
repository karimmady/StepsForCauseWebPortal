import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupFormComponent } from './signup-form/signup-form.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreateUserComponent } from './admin/create-user/create-user.component';
import { CreateTeamComponent } from './admin/create-team/create-team.component';
import { AddStepsComponent } from './admin/add-steps/add-steps.component';
import { UsersComponent } from './admin/users/users.component';
import { CreateAdminComponent } from './admin/create-admin/create-admin.component';
import { AuthGuard } from './auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { TeamsComponent } from './admin/teams/teams.component';
import { StatisticsPageComponent } from './statistics-page/statistics-page.component';
import { CountdownComponent } from './countdown/countdown.component';
const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'signup',
    component: SignupFormComponent
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/create-admin',
    component: CreateAdminComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/create-user',
    component: CreateUserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/create-team',
    component: CreateTeamComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/add-steps',
    component: AddStepsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/users',
    component: UsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/teams',
    component: TeamsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
<<<<<<< HEAD
    path: 'statistics',
    component: StatisticsPageComponent
=======
    path: 'countdown',
    component: CountdownComponent
>>>>>>> 4ad04aa7a9f79fe2c905db73a590a1f2549d4427
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
