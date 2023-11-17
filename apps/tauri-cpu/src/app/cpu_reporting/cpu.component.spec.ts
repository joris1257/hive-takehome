import { TestBed } from '@angular/core/testing';
import { AppComponent } from '../app.component';
import { CpuComponent } from './cpu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { randomFillSync } from 'crypto';
import { mockIPC } from '@tauri-apps/api/mocks';
import { invoke } from '@tauri-apps/api/tauri';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        CpuComponent,
        RouterTestingModule,
        HttpClientModule,
      ],
    }).compileComponents();
  });

  // jsdom doesn't come with a WebCrypto implementation
  beforeAll(() => {
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: (buffer: NodeJS.ArrayBufferView) => {
          return randomFillSync(buffer);
        },
      },
    });
  });

  it('Should call tauri backend', () => {
    mockIPC((cmd) => {
      if (cmd === 'init_cpu') {
        return;
      }
    });
    const fixture = TestBed.createComponent(CpuComponent);
    fixture.detectChanges();
    const spy = jest.spyOn(window, '__TAURI_IPC__');
    invoke('init_cpu');
    expect(spy).toHaveBeenCalled();
  });
});
