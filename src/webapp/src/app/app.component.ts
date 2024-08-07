import { Component } from '@angular/core';
import { EditorComponent } from './editor.component';
import { SessionComponent } from './session.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EditorComponent, SessionComponent],
  template: `
    <h1>Node.js Dynamic Sessions Playground</h1>
    <app-session></app-session>
    <br />
    <app-editor></app-editor>
  `,
  styles: ``,
})
export class AppComponent {}
