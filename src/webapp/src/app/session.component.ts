import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from './session.service';
import { LoaderComponent } from './loader.component';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  template: `
    <fieldset>
      <legend>Session</legend>
      <p>Current session ID: {{ session.sessionId() }}</p>
      @if (wait()) {
        <app-loader></app-loader>
      } @else {
        <p>
          <button (click)="newSession()" [disabled]="wait()">New session</button>
        </p>
      }
      @if (session.files().length && !wait()) {
        <hr />
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Last modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let file of session.files()">
              <td>{{ file.filename }}</td>
              <td>{{ file.size }}</td>
              <td>{{ file.last_modified_time }}</td>
              <td>
                <button (click)="loadFile(file.filename)">Load in editor</button>
                <!-- <button>Download</button> -->
                <button (click)="deleteFile(file.filename)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      }
    </fieldset>
  `,
  styles: `
    table {
      width: 100%;
      border-spacing: 1;
    }
    th,
    td {
      padding: 0.5em;
    }
    th {
      background-color: #f0f0f0;
      text-align: left;
    }
    button + button {
      margin-left: .5em;
    }
  `,
})
export class SessionComponent {
  session = inject(SessionService);
  editor = inject(EditorService);
  wait = signal<boolean>(false);
  load = output<string>();

  ngOnInit() {
    // Get the session ID from the URL query parameter
    const url = new URL(location.href);
    const sessionId = url.searchParams.get('session') ?? undefined;
    this.newSession(sessionId);
  }

  async newSession(sessionId?: string) {
    if (!sessionId) {
      this.session.sessionId.set('');
    }
    this.wait.set(true);
    await this.session.initSession(sessionId);
    this.updateUrl();
    this.wait.set(false);
  }

  async loadFile(filename: string) {
    this.editor.disabled.set(true);
    const content = await this.session.downloadFile(filename);
    this.editor.code.set(content);
    this.editor.filename.set(filename);
    this.editor.disabled.set(false);
  }

  async deleteFile(filename: string) {
    this.wait.set(true);
    await this.session.deleteFile(filename);
    await this.session.listFiles();
    this.wait.set(false);
  }

  private updateUrl() {
    // Update the URL with the current session ID as  a query parameter
    const sessionId = this.session.sessionId();
    const url = new URL(location.href);
    url.searchParams.set('session', sessionId);
    history.replaceState(null, '', url.toString());
  }
}
