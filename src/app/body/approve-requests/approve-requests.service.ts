import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { request } from 'http';

@Injectable({
  providedIn: 'root',
})
export class ApproveRequestsService {
  private apiUrl =
    'https://admintool.v5dev.brandmuscle.net/api/oidc-dashboard/v1/api';

  constructor(private http: HttpClient) {}

  rejectHostUri(request: any): Observable<any> {
    const url = `${this.apiUrl}/reject-host-uri/`;
    return this.http.post(url, request);
  }

  addOrUpdateHostUri(request: any): Observable<any> {
    const url = `${this.apiUrl}/approve-host-uri`;
    return this.http.post(url, request);
  }

  rejectRedirectUri(request: any): Observable<any> {
    const url = `${this.apiUrl}/reject-redirect-uri/`;
    return this.http.post(url, request);
  }

  addOrUpdateRedirectUri(request: any): Observable<any> {
    const url = `${this.apiUrl}/approve-redirect-uri`;
    return this.http.post(url, request);
  }
}
