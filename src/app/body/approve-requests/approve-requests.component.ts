import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { SidebarService } from '../../sidebar/sidebar.service';
import { ApproveRequestsService } from './approve-requests.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-approve-requests',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.css'],
})
export class ApproveRequestsComponent implements OnInit {
  @Input() showActions: boolean = true;
  @Input() showRedirectUris: boolean = true;
  @Input() showHostUris: boolean = true;

  approvalRequests: any[] = [];
  hostUris: any[] = [];
  redirectUris: any[] = [];

  constructor(
    private sidebarService: SidebarService,
    private approveRequestsService: ApproveRequestsService,
    private destroyRef: DestroyRef,
    private datePipe: DatePipe,
    private authService: MsalService
  ) {}

  ngOnInit() {
    const subscription = this.sidebarService.approvalRequests$.subscribe(
      (approvalRequests) => {
        this.approvalRequests = approvalRequests;
        this.hostUris = this.approvalRequests.filter(
          (req) => req.type === 'HostUri' && req.approvalStatus === 'REQUESTED'
        );
        this.redirectUris = this.approvalRequests.filter(
          (req) => req.type === 'RedirectUri' && req.approvalStatus === 'REQUESTED'
        );
      }
    );

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  approveHostUri(request: any) {
    const currentDate = this.getCurrentDate();
    const approvedBy = this.authService.instance.getAllAccounts()[0].username!;
    request.approvalStatus = 'APPROVED';
    request.approvedBy = approvedBy;
    request.approvedDate = currentDate;
    this.approveRequestsService.addOrUpdateHostUri(request).subscribe({
      next: () => {
        console.log('Host URI approved for', request);
        // Remove the approved request from the list
        this.hostUris = this.hostUris.filter((req) => req.id !== request.id);
        this.approvalRequests = this.approvalRequests.filter(
          (req) => req.id !== request.id
        );
      },
      error: (error) => {
        console.error('Error approving host URI:', error);
      },
    });
  }

  rejectHostUri(request: any) {
    const currentDate = this.getCurrentDate();
    const approvedBy = this.authService.instance.getAllAccounts()[0].username!;
    request.approvalStatus = 'REJECTED';
    request.approvedBy = approvedBy;
    request.approvedDate = currentDate;
    this.approveRequestsService.rejectHostUri(request).subscribe({
      next: () => {
        console.log('Reject clicked for', request);
        // Remove the rejected request from the list
        this.hostUris = this.hostUris.filter((req) => req.id !== request.id);
        this.approvalRequests = this.approvalRequests.filter(
          (req) => req.id !== request.id
        );
      },
      error: (error) => {
        console.error('Error deleting host URI:', error);
      },
    });
  }

  approveRedirectUri(request: any) {
    const currentDate = this.getCurrentDate();
    const approvedBy = this.authService.instance.getAllAccounts()[0].username!;
    request.approvalStatus = 'APPROVED';
    request.approvedBy = approvedBy;
    request.approvedDate = currentDate;
    this.approveRequestsService.addOrUpdateRedirectUri(request).subscribe({
      next: () => {
        console.log('Redirect URI approved for', request);
        // Remove the approved request from the list
        this.redirectUris = this.redirectUris.filter(
          (req) => req.id !== request.id
        );
        this.approvalRequests = this.approvalRequests.filter(
          (req) => req.id !== request.id
        );
      },
      error: (error) => {
        console.error('Error approving redirect URI:', error);
      },
    });
  }

  rejectRedirectUri(request: any) {
    const currentDate = this.getCurrentDate();
    const approvedBy = this.authService.instance.getAllAccounts()[0].username!;
    request.approvalStatus = 'REJECTED';
    request.approvedBy = approvedBy;
    request.approvedDate = currentDate;
    this.approveRequestsService.rejectRedirectUri(request).subscribe({
      next: () => {
        console.log('Reject clicked for', request);
        // Remove the rejected request from the list
        this.redirectUris = this.redirectUris.filter(
          (req) => req.id !== request.id
        );
        this.approvalRequests = this.approvalRequests.filter(
          (req) => req.id !== request.id
        );
      },
      error: (error) => {
        console.error('Error deleting redirect URI:', error);
      },
    });
  }
}
