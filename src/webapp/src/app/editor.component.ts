import { Component,  inject,  model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { LoaderComponent } from './loader.component';
import { RunOutput, SessionService } from './session.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule, LoaderComponent],
  template: `
    <fieldset>
      <legend>Code runner</legend>
      <ngx-monaco-editor [options]="editorOptions" [ngModel]="code()" (ngModelChange)="code.set($event)"></ngx-monaco-editor>
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
    </fieldset>
  `,
  styles: ``
})
export class EditorComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code = model<string>('console.log("Hello world!");');
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
