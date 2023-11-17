import {
  Component,
  ViewEncapsulation,
  effect,
  OnInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpuService } from './cpu.service';
import { invoke } from '@tauri-apps/api/tauri';
import { environment } from '../../environments/environment';

@Component({
  selector: 'angular-monorepo-cpu-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cpu.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CpuComponent implements OnInit {
  constructor(private cpuService: CpuService, private zone: NgZone) {
    effect(async () => {
      localStorage.setItem(
        environment.localIsToggledStoreKey,
        JSON.stringify(cpuService.isToggled())
      );
    });
  }
  isToggled = this.cpuService.isToggled;
  cpuUsage$ = this.cpuService.cpuUsage$;

  toggleValue() {
    this.cpuService.isToggled.update((cur) => !cur);
  }

  ngOnInit(): void {
    invoke('init_cpu');
  }
}
