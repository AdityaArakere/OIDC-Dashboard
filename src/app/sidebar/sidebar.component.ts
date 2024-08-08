import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { SidebarService } from './sidebar.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [MatListModule, NgxSpinnerModule, RouterLink],
})
export class SidebarComponent implements OnInit {
  showApprovalRequests = false;

  constructor(
    private sidebarService: SidebarService,
    private spinner: NgxSpinnerService,
    private authService: MsalService
  ) {}

  ngOnInit(): void {
    const email = this.authService.instance
      .getAllAccounts()[0]
      .username.toLowerCase();

    this.getAdmins().subscribe({
      next: (admins) => {
        const lowerCaseAdmins = admins.map((admin: string) =>
          admin.toLowerCase()
        );

        // console.log(lowerCaseAdmins);

        if (lowerCaseAdmins.includes(email)) {
          this.showApprovalRequests = true;
        }
      },
      error: (error) => {
        console.error('Failed to get admins', error);
      },
    });
  }

  displayApplications() {
    this.spinner.show();
    this.sidebarService.getApplications().subscribe({
      next: (response) => {
        console.log(response);
        this.sidebarService.updateApplications(response);
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  displayHosts() {
    this.spinner.show();
    this.sidebarService.getHosts().subscribe({
      next: (response) => {
        console.log(response);
        this.sidebarService.updateHosts(response);
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  displayApproveRequests() {
    this.spinner.show();
    this.sidebarService.getApprovalRequests().subscribe({
      next: (response) => {
        console.log(response);
        this.sidebarService.updateApprovalRequests(response);
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getAdmins(): Observable<string[]> {
    return this.sidebarService.getAdmins();
  }
}
