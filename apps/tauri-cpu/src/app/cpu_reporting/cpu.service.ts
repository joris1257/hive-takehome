import { Injectable, NgZone, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, filter, interval, map, tap } from 'rxjs';
import { CpuRequest, CpuUsage } from '@angular-monorepo/shared-types';
import { environment } from '../../environments/environment';
import { listen } from '@tauri-apps/api/event';

@Injectable({ providedIn: 'root' })
export class CpuService implements OnDestroy {
  private readonly baseUrl: string = 'http://localhost:3333';

  constructor(private http: HttpClient, private zone: NgZone) {}

  ngOnDestroy(): void {
    this.cpuReporting$.unsubscribe();
  }

  isToggled = signal<boolean>(
    localStorage.getItem(environment.localIsToggledStoreKey) === 'true'
  );

  cpuUsage$ = new Observable<CpuUsage>((observer) => {
    const unlisten = listen('cpu-report', (v) => {
      const eventPayload = v.payload as { cpu_usage: string };
      const cpuUsage: CpuUsage = {
        cpuUsage: parseFloat(eventPayload.cpu_usage),
        timeStamp: new Date().toISOString(),
      };

      this.zone.run(() => {
        observer.next(cpuUsage);
      });
    });

    return async () => {
      (await unlisten)();
    };
  }).pipe(
    tap((cpuUsage) => {
      if (environment.production && this.isToggled()) {
        this.storeCpuValues([cpuUsage]);
      }
    })
  );

  cpuReporting$ = interval(3000)
    .pipe(
      filter(() => this.isToggled() && environment.production),
      map(() => {
        const storedValues =
          (JSON.parse(
            localStorage.getItem(environment.localCpuStoreKey) ?? '[]'
          ) as CpuUsage[]) || [];
        localStorage.removeItem(environment.localCpuStoreKey);

        // TODO: Replace with user ID from authentication service in real app
        return {
          userId: '1',
          cpuUsage: storedValues,
        };
      }),
      tap((cpuUsage) => {
        this.post(cpuUsage)
          .pipe(
            catchError((e) => {
              this.storeCpuValues(cpuUsage.cpuUsage);
              return e;
            })
          )
          .subscribe();
      })
    )
    .subscribe();

  storeCpuValues = (cpuUsage: CpuUsage[]) => {
    const storedValues =
      (JSON.parse(
        localStorage.getItem(environment.localCpuStoreKey) ?? '[]'
      ) as CpuUsage[]) || [];
    storedValues.push(...cpuUsage);
    localStorage.setItem(
      environment.localCpuStoreKey,
      JSON.stringify(storedValues)
    );
  };

  post = (data: CpuRequest): Observable<unknown> =>
    this.http.post(
      `${this.baseUrl}/api`,
      {
        message: data,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
}
