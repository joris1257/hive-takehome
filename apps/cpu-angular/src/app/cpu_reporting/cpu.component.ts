import {
  Component,
  ViewEncapsulation,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval } from 'rxjs';
import { bufferCount, filter, map, tap } from 'rxjs/operators';
import { CpuService } from '../cpu.service';
import { CpuUsage } from '@angular-monorepo/shared-types';
import { environment } from '../../environments/environment';

@Component({
  selector: 'angular-monorepo-cpu-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cpu.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcomeComponent implements OnDestroy {
  constructor(private http: CpuService) {
    effect(() =>
      localStorage.setItem('isToggled', JSON.stringify(this.isToggled()))
    );
  }

  isToggled = signal<boolean>(localStorage.getItem('isToggled') === 'true');

  cpuUsage$: Observable<CpuUsage> = interval(1000).pipe(
    map(() => {
      return this.getCpuUsage();
    })
  );

  cpuReporting$ = this.cpuUsage$
    .pipe(
      bufferCount(5),
      filter(() => this.isToggled()),
      filter(() => environment.production),
      tap((cpuUsage) => {
        console.log('Sending cpu usage', cpuUsage);
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

  getCpuUsage(): CpuUsage {
    // Simulating CPU usage data for demonstration purposes
    const simulatedUsage = Math.random() * 100;
    const timeStamp = new Date().toISOString();

    return { cpuUsage: simulatedUsage, timeStamp };
  }
}
