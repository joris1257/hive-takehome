import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CpuComponent } from './cpu_reporting/cpu.component';

@Component({
  standalone: true,
  imports: [CpuComponent, RouterModule],
  selector: 'angular-monorepo-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'angular-monorepo';
}
