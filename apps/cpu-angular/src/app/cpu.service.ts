import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CpuUsage } from '@angular-monorepo/shared-types';

@Injectable({ providedIn: 'root' })
export class CpuService {
  private readonly baseUrl: string = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  post = (data: CpuUsage[] | CpuUsage): Observable<unknown> =>
    this.http.post(
      `${this.baseUrl}`,
      {
        message: data,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
}
