import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { MemoryStorage } from '../../../testing/memory-storage';
import { translocoTesting } from '../../../testing/transloco-testing';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../storage/storage.service';
import { BROWSER_LANGUAGES } from './browser-languages.token';
import { LanguageService } from './language.service';

const KEY = `${STORAGE_PREFIX}:language`;

describe('LanguageService', () => {
  let storage: MemoryStorage;

  function setup(browserLanguages: readonly string[] = ['pt-BR']): LanguageService {
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: BROWSER_LANGUAGES, useValue: browserLanguages },
      ],
    });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('restores the persisted language even if the browser prefers another one', () => {
    storage.setItem(KEY, JSON.stringify('en'));
    const service = setup(['pt-BR']);
    expect(service.current()).toBe('en');
    expect(service.locale()).toBe('en-US');
  });

  it('detects the browser language on the first visit', () => {
    expect(setup(['pt-PT']).current()).toBe('pt-BR');
  });

  it('uses English for non-Portuguese browsers', () => {
    expect(setup(['de-DE']).current()).toBe('en');
  });

  it('ignores unsupported persisted values', () => {
    storage.setItem(KEY, JSON.stringify('fr'));
    expect(setup(['en-US']).current()).toBe('en');
  });

  it('defaults to pt-BR when the browser reports no language', () => {
    expect(setup([]).current()).toBe('pt-BR');
  });

  it('applies <html lang> on init', () => {
    const service = setup(['en-US']);
    service.init().subscribe();
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });

  it('switches Transloco, the formatting locale and <html lang>, and persists the choice', () => {
    const service = setup(['pt-BR']);
    const transloco = TestBed.inject(TranslocoService);

    service.use('en');

    expect(service.current()).toBe('en');
    expect(service.locale()).toBe('en-US');
    expect(transloco.getActiveLang()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(JSON.parse(storage.getItem(KEY) ?? '""')).toBe('en');
    expect(transloco.translate('nav.clients')).toBe('Clients');

    service.use('pt-BR');
    expect(service.locale()).toBe('pt-BR');
    expect(transloco.translate('nav.clients')).toBe('Clientes');
  });
});
