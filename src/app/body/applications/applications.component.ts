import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarService } from '../../sidebar/sidebar.service';
import { ApplicationsService } from './applications.service';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApproveRequestsComponent } from '../approve-requests/approve-requests.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsalService } from '@azure/msal-angular';

interface Application {
  displayName: string;
  redirectUris: string[];
  showAddUriForm?: boolean;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css'],
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
export class ApplicationsComponent implements OnInit {
  applications: Application[] = [];
  requestedBy = this.authService.instance.getAllAccounts()[0].username!;
  showAddUriForm = false;
  uriForm!: FormGroup;
  editUriForm: FormGroup[][] = [];
  editMode: boolean[][] = [];
  originalUri: string[][] = [];
  applicationsRegex =
    '^(http://www.|https://www.|http://|https://)+[a-zA-Z0-9]+([\\-\\.]{1}[a-z0-9]+)*(\\.[a-z]{2,5})*(\\:[0-9]{1,5})?(\\/.*)?$';

  constructor(
    private sidebarService: SidebarService,
    private applicationsService: ApplicationsService,
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
    private snackBar: MatSnackBar,
    private authService: MsalService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const subscription = this.sidebarService.applications$.subscribe(
      (applications: Application[]) => {
        this.applications = applications;
        this.applications.forEach((application, appIndex) => {
          // console.log(application);
          if (application.redirectUris.length === 1) {
            application.redirectUris = JSON.parse(
              application.redirectUris as any
            );
          }
          this.editMode[appIndex] = [];
          this.editUriForm[appIndex] = [];
          this.originalUri[appIndex] = [];

          application.redirectUris.forEach((uri: string, uriIndex: number) => {
            this.editMode[appIndex][uriIndex] = false;
            this.originalUri[appIndex][uriIndex] = uri;
            this.editUriForm[appIndex][uriIndex] = this.fb.group({
              editedUri: [
                uri,
                {
                  validators: [
                    Validators.required,
                    Validators.pattern(this.applicationsRegex),
                  ],
                  updateOn: 'change',
                },
              ],
            });
          });
        });
      }
    );

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    this.uriForm = this.fb.group({
      newUri: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(this.applicationsRegex),
          ],
          updateOn: 'change',
        },
      ],
    });
    this.refreshHosts();
  }

  getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  addUri(application: Application) {
    const displayName = application.displayName;
    const currentDate = this.getCurrentDate();
    // console.log('display name is', displayName);
    if (this.uriForm.valid) {
      const newUri = this.uriForm.get('newUri')!.value;
      if (application.redirectUris.some((uri) => uri === newUri)) {
        console.log('URI already exists!');
        alert('URI already exists!');
        this.uriForm.reset();
        application.showAddUriForm = false;
      } else {
        this.applicationsService
          .addRedirectUri(
            this.requestedBy,
            newUri,
            'NULL',
            displayName,
            currentDate,
            'REQUESTED'
          )
          .subscribe({
            next: () => {
              this.uriForm.reset();
              application.showAddUriForm = false;
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

  toggleEditMode(appIndex: number, uriIndex: number) {
    if (!this.editMode[appIndex][uriIndex]) {
      this.originalUri[appIndex][uriIndex] =
        this.editUriForm[appIndex][uriIndex].get('editedUri')!.value;
    }
    this.editMode[appIndex][uriIndex] = !this.editMode[appIndex][uriIndex];
  }

  saveEditUri(appIndex: number, uriIndex: number) {
    const currentDate = this.getCurrentDate();
    if (this.editUriForm[appIndex][uriIndex].valid) {
      const editedUri =
        this.editUriForm[appIndex][uriIndex].get('editedUri')!.value;
      const originalUri = this.applications[appIndex].redirectUris[uriIndex];
      const displayName = this.applications[appIndex].displayName;
      // console.log('Display Name:', displayName);
      console.log(`Original URI: ${originalUri}, Edited URI: ${editedUri}`);
      this.editMode[appIndex][uriIndex] = false;

      if (
        this.applications[appIndex].redirectUris.some(
          (uri) => uri === editedUri
        )
      ) {
        console.log('URI already exists!');
        alert('URI already exists!');
        this.applications[appIndex].redirectUris[uriIndex] = originalUri;
      } else {
        this.applications[appIndex].redirectUris[uriIndex] = editedUri;
        this.applicationsService
          .addRedirectUri(
            this.requestedBy,
            editedUri,
            originalUri,
            displayName,
            currentDate,
            'REQUESTED'
          )
          .subscribe({
            next: () => {
              console.log('URI edited successfully!');
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

  cancelEdit(appIndex: number, uriIndex: number) {
    this.editUriForm[appIndex][uriIndex]
      .get('editedUri')!
      .setValue(this.originalUri[appIndex][uriIndex]);
    this.editMode[appIndex][uriIndex] = false;
  }

  invalidEditUri(appIndex: number, uriIndex: number) {
    return (
      this.editUriForm[appIndex][uriIndex].get('editedUri')!.invalid &&
      (this.editUriForm[appIndex][uriIndex].get('editedUri')!.dirty ||
        this.editUriForm[appIndex][uriIndex].get('editedUri')!.touched)
    );
  }

  invalidAddUri() {
    return (
      this.uriForm.get('newUri')!.invalid &&
      (this.uriForm.get('newUri')!.dirty || this.uriForm.get('newUri')!.touched)
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
