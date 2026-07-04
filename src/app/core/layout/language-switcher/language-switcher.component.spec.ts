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
    const group = () => element.querySelector<HTMLElement>('[role="group"]');
    /** Finds a button by its accessible name (the native language name). */
    const button = (name: string) =>
      [...element.querySelectorAll<HTMLButtonElement>('button')].find(
        (candidate) => candidate.getAttribute('aria-label') === name,
      );
    return { fixture, group, button };
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('renders one flag button per language inside a labelled group', () => {
    const { group, button } = render();
    expect(group()?.getAttribute('aria-label')).toBe('Idioma');

    const portuguese = button('Português (Brasil)');
    const english = button('English');
    expect(portuguese?.getAttribute('title')).toBe('Português (Brasil)');
    expect(portuguese?.getAttribute('lang')).toBe('pt-BR');
    expect(english?.getAttribute('title')).toBe('English');
    expect(english?.getAttribute('lang')).toBe('en');
  });

  it('shows flags as decorative images and no PT/EN text', () => {
    const { group, button } = render();
    for (const name of ['Português (Brasil)', 'English']) {
      const flag = button(name)?.querySelector('app-flag');
      expect(flag?.getAttribute('aria-hidden')).toBe('true');
      expect(flag?.querySelector('svg')).toBeTruthy();
    }
    expect(group()?.textContent?.trim()).toBe('');
  });

  it('marks the current language as pressed', () => {
    const { button } = render();
    expect(button('Português (Brasil)')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('English')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to English, persists the choice and relabels the group', async () => {
    const { fixture, group, button } = render();

    button('English')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(button('English')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('English')?.classList).toContain('is-active');
    expect(button('Português (Brasil)')?.getAttribute('aria-pressed')).toBe('false');
    expect(JSON.parse(storage.getItem(`${STORAGE_PREFIX}:language`) ?? '""')).toBe('en');
    expect(group()?.getAttribute('aria-label')).toBe('Language');
  });
});
