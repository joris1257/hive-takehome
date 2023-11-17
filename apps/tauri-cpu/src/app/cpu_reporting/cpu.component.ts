import {
  Component,
  ViewEncapsulation,
  OnDestroy,
  signal,
  effect,
  OnInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { CpuService } from '../cpu.service';
import { CpuUsage } from '@angular-monorepo/shared-types';
import { environment } from '../../environments/environment';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

@Component({
  selector: 'angular-monorepo-cpu-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cpu.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CpuComponent implements OnDestroy, OnInit {
  constructor(private http: CpuService, private zone: NgZone) {
    effect(async () => {
      localStorage.setItem('isToggled', JSON.stringify(this.isToggled()));
    });
  }

  isToggled = signal<boolean>(localStorage.getItem('isToggled') === 'true');

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

  storeCpuValues = (cpuUsage: CpuUsage[]) => {
    const storedValues =
      (JSON.parse(
        localStorage.getItem('storedCpuValues') ?? '[]'
      ) as CpuUsage[]) || [];
    storedValues.push(...cpuUsage);
    localStorage.setItem('storedCpuValues', JSON.stringify(storedValues));
  };

  cpuReporting$ = interval(3000)
    .pipe(
      filter(() => this.isToggled() && environment.production),
      map(() => {
        const storedValues =
          (JSON.parse(
            localStorage.getItem('storedCpuValues') ?? '[]'
          ) as CpuUsage[]) || [];
        // Clearing it in this way may result in data loss
        localStorage.removeItem('storedCpuValues');

        // TODO: Replace with user ID from authentication service in real app
        return {
          userId: '1',
          cpuUsage: storedValues,
        };
      }),
      tap((cpuUsage) => {
        this.http
          .post(cpuUsage)
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

  // this.cpuUsage$
  //   .pipe(
  //     bufferCount(5),
  //     filter(() => this.isToggled()),
  //     filter(() => environment.production),
  //     map((cpuUsage) => {
  //       // TODO: Replace with user ID from authentication service in real app
  //       return {
  //         userId: '1',
  //         cpuUsage,
  //       };
  //     }),
  //     tap((cpuUsage) => {
  //       this.http.post(cpuUsage).subscribe((e) => console.log(e));
  //     })
  //   )
  //   .subscribe();

  toggleValue() {
    this.isToggled.update((cur) => !cur);
  }

  ngOnDestroy(): void {
    this.cpuReporting$.unsubscribe();
  }

  ngOnInit(): void {
    invoke('init_cpu');
  }
}
