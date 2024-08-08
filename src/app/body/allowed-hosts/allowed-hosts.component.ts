import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarService } from '../../sidebar/sidebar.service';
import { AllowedHostsService } from './allowed-hosts.service';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { response } from 'express';
import { ApproveRequestsComponent } from '../approve-requests/approve-requests.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-allowed-hosts',
  standalone: true,
  templateUrl: './allowed-hosts.component.html',
  styleUrls: ['./allowed-hosts.component.css'],
  imports: [
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ApproveRequestsComponent,
  ],
})
export class AllowedHostsComponent implements OnInit {
  hosts: any[] = [];
  showAddUriForm = false;
  requestedBy = this.authService.instance.getAllAccounts()[0].username!;
  uriForm!: FormGroup;
  editUriForm: { [key: string]: FormGroup } = {};
  editMode: { [key: string]: boolean } = {};
  originalHostUri: { [key: string]: string } = {};
  hostRegex = '^[*A-Za-z0-9]+([-.]{1}[a-z0-9]+)*(.){1}[a-z]{2,5}$';

  constructor(
    private sidebarService: SidebarService,
    private allowedHostsService: AllowedHostsService,
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private snackBar: MatSnackBar,
    private authService: MsalService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const subscription = this.sidebarService.hosts$.subscribe((hosts) => {
      this.hosts = hosts;
      this.hosts.forEach((host, index) => {
        this.editMode[index] = false;
        this.editUriForm[index] = this.fb.group({
          editedHostUri: [
            host,
            {
              validators: [
                Validators.required,
                Validators.pattern(this.hostRegex),
              ],
              updateOn: 'change',
            },
          ],
        });
      });
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    this.uriForm = this.fb.group({
      newHostUri: [
        '',
        {
          validators: [Validators.required, Validators.pattern(this.hostRegex)],
          updateOn: 'change',
        },
      ],
    });
    this.refreshHosts();
  }

  onShowAddUriForm() {
    this.showAddUriForm = true;
  }

  onHideAddUriForm() {
    this.showAddUriForm = false;
  }

  getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  addHostUri() {
    if (this.uriForm.valid) {
      const newHostUri = this.uriForm.get('newHostUri')!.value;
      const currentDate = this.getCurrentDate();
      if (this.hosts.some((host) => host === newHostUri)) {
        console.log('Host already exists!');
        alert('Host already exists!');
        this.uriForm.reset();
        this.showAddUriForm = false;
      } else {
        this.allowedHostsService
          .addHostUri(this.requestedBy, newHostUri, 'NULL', currentDate, 'REQUESTED')
          .subscribe({
            next: () => {
              this.uriForm.reset();
              this.showAddUriForm = false;
              console.log('URI added successfully!');
            },
            error: (error) => {
              console.error('There was an error!', error);
              this.snackBar.open('error adding uri', '', {
                duration: 2000,
              });
            },
            complete: () => {
              this.snackBar.open('successfully added', '', {
                duration: 2000,
              });
              this.refreshHosts();
            },
          });
      }
    }
  }

  toggleEditMode(index: number) {
    if (!this.editMode[index]) {
      // Entering edit mode, save the original value
      this.originalHostUri[index] =
        this.editUriForm[index].get('editedHostUri')!.value;
    }
    this.editMode[index] = !this.editMode[index];
  }

  saveEditUri(index: number) {
    const currentDate = this.getCurrentDate();
    if (this.editUriForm[index].valid) {
      const editedHostUri = this.editUriForm[index].get('editedHostUri')!.value;
      const originalHostUri = this.hosts[index];
      console.log(
        `Original URI: ${originalHostUri}, Edited URI: ${editedHostUri}`
      );
      this.editMode[index] = false;

      if (this.hosts.some((host) => host === editedHostUri)) {
        console.log('Host already exists!');
        alert('Host already exists!');
        this.hosts[index] = originalHostUri;
        this.editMode[index] = false;
      } else {
        this.hosts[index] = editedHostUri; // Update the hosts array with the edited URI
        this.allowedHostsService
          .addHostUri(
            this.requestedBy,
            editedHostUri,
            originalHostUri,
            currentDate,
            'REQUESTED'
          )
          .subscribe({
            next: () => {
              this.uriForm.reset();
              this.showAddUriForm = false;
              console.log('URI added successfully!');
            },
            error: (error) => {
              console.error('There was an error!', error);
              this.snackBar.open('error saving uri', '', {
                duration: 2000,
              });
            },
            complete: () => {
              this.snackBar.open('successfully edited', '', {
                duration: 2000,
              });
              this.refreshHosts();
            },
          });
      }
    }
  }

  cancelEdit(index: number) {
    // Restore the original value
    this.editUriForm[index]
      .get('editedHostUri')!
      .setValue(this.originalHostUri[index]);
    this.editMode[index] = false;
  }

  invalidEditUri(index: number) {
    return (
      this.editUriForm[index].get('editedHostUri')!.invalid &&
      (this.editUriForm[index].get('editedHostUri')!.dirty ||
        this.editUriForm[index].get('editedHostUri')!.touched)
    );
  }

  invalidAddUri() {
    return (
      this.uriForm.get('newHostUri')!.invalid &&
      (this.uriForm.get('newHostUri')!.dirty ||
        this.uriForm.get('newHostUri')!.touched)
    );
  }

  refreshHosts() {
    this.sidebarService.getApprovalRequests().subscribe({
      next: (response) => {
        // console.log('refresh');
        this.sidebarService.updateApprovalRequests(response);
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }
}
