import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private applicationsSubject = new BehaviorSubject<any[]>([]);
  applications$ = this.applicationsSubject.asObservable();

  private hostsSubject = new BehaviorSubject<any[]>([]);
  hosts$ = this.hostsSubject.asObservable();

  private approvalRequestsSubject = new BehaviorSubject<any[]>([]);
  approvalRequests$ = this.approvalRequestsSubject.asObservable();

  private apiUrl =
    'https://admintool.v5dev.brandmuscle.net/api/oidc-dashboard/v1/api';

  constructor(private http: HttpClient) {}

  getApplications(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/applications');
  }
  updateApplications(applications: any[]) {
    this.applicationsSubject.next(applications);
  }

  getHosts(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/allowed-hosts');
  }
  updateHosts(hosts: any[]) {
    this.hostsSubject.next(hosts);
  }

  getApprovalRequests(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/approval-requests');
  }
  updateApprovalRequests(approvalRequests: any[]) {
    this.approvalRequestsSubject.next(approvalRequests);
  }

  getAdmins(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/admins');
  }
}
