import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BodyComponent } from './body/body.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { ApplicationsComponent } from './body/applications/applications.component';
import { AllowedHostsComponent } from './body/allowed-hosts/allowed-hosts.component';
import { ApproveRequestsComponent } from './body/approve-requests/approve-requests.component';
import { Subject, filter, flatMap, takeUntil } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionRequiredAuthError,
  InteractionStatus,
  SilentRequest,
} from '@azure/msal-browser';
import { LoginComponent } from './login/login.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    BodyComponent,
    SidebarComponent,
    HeaderComponent,
    MatToolbarModule,
    MatListModule,
    ApplicationsComponent,
    AllowedHostsComponent,
    ApproveRequestsComponent,
    LoginComponent,
    NgxSpinnerModule,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  activeAccounts = false;

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAccount();
      });
  }

  checkAccount(): void {
    console.log('here second');
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length === 0) {
      console.log('no accounts right now');
      // this.router.navigate(['/login']);
    } else {
      this.activeAccounts = true;
      console.log('accounts', accounts);
      this.authService.instance.setActiveAccount(accounts[0]);
      // this.acquireTokenSilently();
    }
  }

  // acquireTokenSilently(): void {
  //   const request: SilentRequest = {
  //     scopes: ['user.read'],
  //     account: this.authService.instance.getActiveAccount()!,
  //   };
  //   this.authService.instance
  //     .acquireTokenSilent(request)
  //     .then((response: AuthenticationResult) => {
  //       console.log('Token acquired silently:', response.accessToken);
  //     })
  //     .catch((error) => {
  //       console.error('Token acquisition error:', error);
  //       if (error instanceof InteractionRequiredAuthError) {
  //         this.authService.instance.acquireTokenRedirect(request);
  //       } else {
  //         console.error('Token acquisition error:', error);
  //       }
  //       this.router.navigate(['/login']);
  //     });
  // }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
