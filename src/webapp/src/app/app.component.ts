import { Component, signal } from '@angular/core';
import { EditorComponent } from "./editor.component";
import { SessionComponent } from './session.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EditorComponent, SessionComponent],
  template: `
    <h1>Node.js Dynamic Sessions Playground</h1>
    <app-session></app-session>
    <app-editor [(code)]="code"></app-editor>
    <button (click)="runCode()">Run code</button>
  `,
  styles: [],
})
export class AppComponent {
  code = signal<string>('console.log("Hello world!");');

  runCode() {
    console.log(this.code());
  }
}
