import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [MatToolbarModule, RouterLink],
})
export class HeaderComponent implements OnInit {
  // @Output() showDashboard = new EventEmitter<void>();

  constructor(private authService: MsalService) {}

  async ngOnInit(): Promise<void> {
    await this.authService.instance.initialize();
    this.authService.instance.handleRedirectPromise().then((response) => {
      if (response) {
        this.authService.instance.setActiveAccount(response.account);
      }
    });
  }

  // displayDashboard() {
  //   this.showDashboard.emit();
  // }

  logout(): void {
    this.authService.logout();
  }
}
