import { Component, inject, signal } from '@angular/core';
import { EditorComponent } from "./editor.component";
import { SessionComponent } from './session.component';
import { RunOutput, SessionService } from './session.service';
import { LoaderComponent } from './loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EditorComponent, SessionComponent, LoaderComponent],
  template: `
    <h1>Node.js Dynamic Sessions Playground</h1>
    <app-session></app-session>
    <hr>
    <app-editor [(code)]="code"></app-editor>
    @if (wait()) {
      <app-loader></app-loader>
    }
    @else {
      <pre>{{ stringify(result() ?? {}) }}</pre>
    }
    <hr>
    <p>
      <button (click)="runCode()" [disabled]="!session.sessionId() || wait()">Run code</button>
    </p>
  `,
  styles: [],
})
export class AppComponent {
  code = signal<string>('console.log("Hello world!");');
  session = inject(SessionService);
  result = signal<RunOutput | undefined>(undefined);
  wait = signal<boolean>(false);

  async runCode() {
    this.wait.set(true);
    const result = await this.session.runCode(this.code());
    this.result.set(result);
    this.wait.set(false);
  }

  stringify(value: any) {
    return JSON.stringify(value, null, 2);
  }
}
