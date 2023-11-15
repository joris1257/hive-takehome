import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './cpu_reporting/cpu.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'angular-monorepo-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'angular-monorepo';
}
