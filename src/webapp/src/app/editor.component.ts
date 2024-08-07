import { Component,  model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  template: `
    <ngx-monaco-editor [options]="editorOptions" [ngModel]="code()" (ngModelChange)="code.set($event)"></ngx-monaco-editor>
  `,
  styles: ``
})
export class EditorComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code = model<string>('');
}
