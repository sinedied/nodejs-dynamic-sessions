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
      <p class="button">
        <button (click)="runCode()" [disabled]="!session.sessionId() || wait()">Run code</button>
        <input type="text" [ngModel]="packageName()" (ngModelChange)="packageName.set($event)" placeholder="Package name">
        <button (click)="npmInstall()" [disabled]="!session.sessionId() || wait()">Install package</button>
        <input type="text" [ngModel]="filename()" (ngModelChange)="filename.set($event)" placeholder="File name">
        <button (click)="saveFile()" [disabled]="!session.sessionId() || wait()">Save file</button>
      </p>
    </fieldset>
  `,
  styles: `
    input {
      margin-left: 2em;
      margin-right: .5em;
    }
  `
})
export class EditorComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code = model<string>('console.log("Hello world!");');
  session = inject(SessionService);
  result = signal<RunOutput | undefined>(undefined);
  wait = signal<boolean>(false);
  packageName = signal<string>('');
  filename = signal<string>('');

  async runCode() {
    this.wait.set(true);
    const result = await this.session.runCode(this.code());
    this.result.set(result);
    this.wait.set(false);
  }

  async npmInstall() {
    this.wait.set(true);
    const result = await this.session.npmInstall(this.packageName());
    this.result.set(result);
    this.wait.set(false);
  }

  async saveFile() {
    this.wait.set(true);
    await this.session.uploadFile(this.filename(), new Blob([this.code()], { type: 'text/plain' }));
    this.wait.set(false);
  }

  stringify(value: any) {
    return JSON.stringify(value, null, 2);
  }
}
