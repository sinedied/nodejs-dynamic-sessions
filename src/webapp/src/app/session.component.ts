import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from './session.service';
import { LoaderComponent } from './loader.component';

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
      }
      @else {
        <p>
          <button (click)="newSession()" [disabled]="wait()">New session</button>
        </p>
      }
      @if (session.files().length && !wait()) {
        <hr>
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
                <!-- <button>Load in editor</button> -->
                <!-- <button>Download</button> -->
                <!-- <button>Delete</button> -->
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
    th, td {
      padding: .5em;
    }
    th {
      background-color: #f0f0f0;
      text-align: left;
    }
  `
})
export class SessionComponent {
  session = inject(SessionService);
  wait = signal<boolean>(false);

  ngOnInit() {
    // Get the session ID from the URL query parameter
    const url = new URL(location.href);
    const sessionId = url.searchParams.get('session') ?? undefined;
    this.newSession(sessionId);
  }

  async newSession(sessionId?: string) {
    this.wait.set(true);
    await this.session.initSession(sessionId);
    this.updateUrl();
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
