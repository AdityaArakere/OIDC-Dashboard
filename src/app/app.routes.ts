import { Routes } from '@angular/router';
import { ApproveRequestsComponent } from './body/approve-requests/approve-requests.component';
import { AllowedHostsComponent } from './body/allowed-hosts/allowed-hosts.component';
import { ApplicationsComponent } from './body/applications/applications.component';
import { BodyComponent } from './body/body.component';
import { LoginComponent } from './login/login.component';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    component: BodyComponent,
  },
  {
    path: 'applications',
    component: ApplicationsComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'hosts',
    component: AllowedHostsComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'approveRequests',
    component: ApproveRequestsComponent,
    canActivate: [MsalGuard],
  },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },
  { path: '**', redirectTo: '/' },
];
