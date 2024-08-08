import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatToolbarModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(private authService: MsalService, private router: Router) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.authService.handleRedirectObservable().subscribe({
      next: (response: AuthenticationResult | null) => {
        console.log('Observable emitted');
        if (response) {
          console.log('Login successful');
          this.authService.instance.setActiveAccount(response.account);
          this.router.navigate(['/']); // Redirect to main application
        } else {
          console.log('Login failed2');
          this.checkAccount();
        }
      },
      error: (error) => {
        console.error('Login failed', error);
      },
    });
  }

  checkAccount(): void {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.authService.instance.setActiveAccount(accounts[0]);
      this.router.navigate(['/']);
    } else {
      console.log('testing check');
      // this.router.navigate(['/applications']);
      // this.login();
    }
  }

  login(): void {
    this.authService.loginRedirect(); // Initiate login process
  }
}
