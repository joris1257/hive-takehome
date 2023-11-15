import {
  Component,
  ViewEncapsulation,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval } from 'rxjs';
import { bufferCount, map, takeWhile, tap } from 'rxjs/operators';
import { CpuService } from '../cpu.service';
import { CpuUsage } from '@angular-monorepo/shared-types';

@Component({
  selector: 'angular-monorepo-nx-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `<div>
    <h2 class="text-s font-bold underline">
      CPU Usage: {{ (cpuUsage$ | async)?.cpuUsage }}%
    </h2>
    <div class="flex items-center">
      <button
        type="button"
        (click)="toggleValue()"
        class="'bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2' + {{
          isToggled() ? 'bg-indigo-600' : 'bg-gray-200'
        }}"
        role="switch"
        aria-checked="false"
        aria-labelledby="annual-billing-label"
      >
        <span
          aria-hidden="true"
          class="'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'+ {{
            isToggled() ? 'translate-x-5' : 'translate-x-0'
          }}"
        ></span>
      </button>
      <span class="ml-3 text-sm" id="annual-billing-label">
        <span class="font-medium text-gray-900">CPU monitoring</span>
        <span class="text-gray-500">(Save 10%)</span>
      </span>
    </div>
  </div>`,
  // templateUrl: './cpu.component.html',

  styles: [],
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
      takeWhile(() => this.isToggled()),
      tap((cpuUsage) => {
        console.log(`Sending CPU usage data: ${cpuUsage}%`);
        this.http.post(cpuUsage).subscribe((e) => console.log(e));
      })
    )
    .subscribe();

  toggleValue() {
    this.isToggled.update((cur) => !cur);
  }

  ngOnDestroy(): void {
    this.cpuReporting$.unsubscribe();
    // Make function that returns first 10 fibonnaci numbers
  }

  getCpuUsage(): CpuUsage {
    // Simulating CPU usage data for demonstration purposes
    const simulatedUsage = Math.random() * 100;
    const timeStamp = new Date().toISOString();

    return { cpuUsage: simulatedUsage, timeStamp };
  }
}
