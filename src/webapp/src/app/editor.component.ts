import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { LoaderComponent } from './loader.component';
import { SessionService } from './session.service';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule, LoaderComponent],
  template: `
    <fieldset>
      <legend>Code runner</legend>
      @if (editor.disabled()) {
        <app-loader></app-loader>
      } @else {
        <ngx-monaco-editor
          [options]="editor.editorOptions"
          [ngModel]="editor.code()"
          (ngModelChange)="editor.code.set($event)"
        ></ngx-monaco-editor>
      }
      @if (editor.wait()) {
        <app-loader></app-loader>
      } @else {
        <pre>{{ stringify(editor.result() ?? {}) }}</pre>
      }
      <hr />
      <p>
        <button (click)="runCode()" [disabled]="!session.sessionId() || editor.wait()">Run code</button>
        <input
          type="text"
          [ngModel]="editor.filename()"
          (ngModelChange)="editor.filename.set($event)"
          placeholder="File name"
        />
        <button (click)="saveFile()" [disabled]="!session.sessionId() || editor.wait()">Save file</button>
      </p>
      <hr />
      <p>
        <button (click)="listPackages()" [disabled]="!session.sessionId() || editor.wait()">List packages</button>
        <input
          type="text"
          [ngModel]="editor.packageName()"
          (ngModelChange)="editor.packageName.set($event)"
          placeholder="Package name"
        />
        <button (click)="npmInstall()" [disabled]="!session.sessionId() || editor.wait()">Install package</button>
      </p>
    </fieldset>
  `,
  styles: `
    input {
      margin-left: 2em;
      margin-right: 0.5em;
    }
    button + button {
      margin-left: 2em;
    }
    pre {
      white-space: pre-wrap;
    }
  `,
})
export class EditorComponent {
  editor = inject(EditorService);
  session = inject(SessionService);

  async runCode() {
    this.editor.wait.set(true);
    const result = await this.session.runCode(this.editor.code());
    this.editor.result.set(result);
    this.editor.wait.set(false);
  }

  async npmInstall() {
    this.editor.wait.set(true);
    const result = await this.session.npmInstall(this.editor.packageName());
    this.editor.result.set(result);
    this.editor.wait.set(false);
  }

  async listPackages() {
    this.editor.wait.set(true);
    const result = await this.session.listNpmPackages();
    this.editor.result.set(result);
    this.editor.wait.set(false);
  }

  async saveFile() {
    this.editor.wait.set(true);
    await this.session.uploadFile(this.editor.filename(), new Blob([this.editor.code()], { type: 'text/plain' }));
    this.editor.wait.set(false);
  }

  stringify(value: any) {
    return JSON.stringify(value, null, 2);
  }
}
