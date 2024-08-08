import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AllowedHostsService {
  private apiUrl = 'https://admintool.v5dev.brandmuscle.net/api/oidc-dashboard/v1/api';

  constructor(private http: HttpClient) {}

  addHostUri(
    requestedBy: string,
    newHostUri: string,
    originalHostUri: string | null,
    currentDate: string,
    approvalStatus: string
  ) {
    return this.http.post(this.apiUrl + '/add-host-uri', {
      requestedBy,
      newHostUri,
      originalHostUri,
      currentDate,
      approvalStatus,
    });
  }

  getAllHosts(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl + '/allowed-hosts');
  }
}
