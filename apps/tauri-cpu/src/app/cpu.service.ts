import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CpuRequest } from '@angular-monorepo/shared-types';

@Injectable({ providedIn: 'root' })
export class CpuService {
  private readonly baseUrl: string = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  post = (data: CpuRequest): Observable<unknown> =>
    this.http.post(
      `${this.baseUrl}/api`,
      {
        message: data,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
}
