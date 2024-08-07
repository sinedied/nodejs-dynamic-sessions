import { Injectable, signal } from '@angular/core';
import { RunOutput } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code = signal<string>('console.log("Hello world!");');
  result = signal<RunOutput | undefined>(undefined);
  packageName = signal<string>('');
  filename = signal<string>('');
  wait = signal<boolean>(false);
  disabled = signal<boolean>(false);
}
