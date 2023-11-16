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
import { Observable } from 'rxjs';
import { bufferCount, filter, tap } from 'rxjs/operators';
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
export class NxWelcomeComponent implements OnDestroy, OnInit {
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
  });

  cpuReporting$ = this.cpuUsage$
    .pipe(
      bufferCount(5),
      filter(() => this.isToggled()),
      filter(() => environment.production),
      tap((cpuUsage) => {
        this.http.post(cpuUsage).subscribe((e) => console.log(e));
      })
    )
    .subscribe();

  toggleValue() {
    this.isToggled.update((cur) => !cur);
  }

  ngOnDestroy(): void {
    this.cpuReporting$.unsubscribe();
  }

  ngOnInit(): void {
    invoke('init_cpu');
  }

  getCpuUsage(): CpuUsage {
    // Simulating CPU usage data for demonstration purposes
    const simulatedUsage = Math.random() * 100;
    const timeStamp = new Date().toISOString();

    return { cpuUsage: simulatedUsage, timeStamp };
  }
}
