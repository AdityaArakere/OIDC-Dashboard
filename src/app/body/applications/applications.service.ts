import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { app } from '../../../../server';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private apiUrl = 'https://admintool.v5dev.brandmuscle.net/api/oidc-dashboard/v1/api';

  constructor(private http: HttpClient) {}

  addRedirectUri(
    requestedBy: string,
    newRedirectUri: string,
    originalRedirectUri: string | null,
    displayName: string,
    currentDate: string,
    approvalStatus: string
  ) {
    console.log(requestedBy, newRedirectUri, originalRedirectUri, displayName, currentDate, approvalStatus);
    return this.http.post(this.apiUrl + '/add-redirect-uri', {
      requestedBy,
      newRedirectUri,
      originalRedirectUri,
      displayName,
      currentDate,
      approvalStatus,
    });
  }
}
