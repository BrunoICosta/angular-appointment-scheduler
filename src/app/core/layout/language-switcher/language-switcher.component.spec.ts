import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { MemoryStorage } from '../../../../testing/memory-storage';
import { translocoTesting } from '../../../../testing/transloco-testing';
import { BROWSER_LANGUAGES } from '../../i18n/browser-languages.token';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../../storage/storage.service';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let storage: MemoryStorage;

  function render() {
    TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent, translocoTesting()],
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: BROWSER_LANGUAGES, useValue: ['pt-BR'] },
      ],
    });
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    return { fixture, element, button };
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('renders an accessible group that marks the current language', () => {
    const { element, button } = render();
    expect(element.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Idioma');
    expect(button('Português (Brasil)')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('English')?.getAttribute('aria-pressed')).toBe('false');
    expect(button('English')?.getAttribute('lang')).toBe('en');
  });

  it('switches to English, persists the choice and relabels itself', async () => {
    const { fixture, element, button } = render();

    button('English')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(button('English')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('Português (Brasil)')?.getAttribute('aria-pressed')).toBe('false');
    expect(JSON.parse(storage.getItem(`${STORAGE_PREFIX}:language`) ?? '""')).toBe('en');
    expect(element.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Language');
  });
});
