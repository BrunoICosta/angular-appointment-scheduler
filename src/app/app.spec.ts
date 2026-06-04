import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { translocoTesting } from '../testing/transloco-testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, translocoTesting()],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the translated app name', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Agendaí');
  });
});
