import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { MemoryStorage } from '../../../testing/memory-storage';
import { translocoTesting } from '../../../testing/transloco-testing';
import { BROWSER_STORAGE, STORAGE_PREFIX } from '../storage/storage.service';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let storage: MemoryStorage;

  function setup(): LanguageService {
    TestBed.configureTestingModule({
      imports: [translocoTesting()],
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('restores the persisted language', () => {
    storage.setItem(`${STORAGE_PREFIX}:language`, JSON.stringify('en'));
    const service = setup();
    expect(service.current()).toBe('en');
    expect(service.locale()).toBe('en-US');
  });

  it('ignores unsupported persisted values', () => {
    storage.setItem(`${STORAGE_PREFIX}:language`, JSON.stringify('fr'));
    const service = setup();
    expect(['pt-BR', 'en']).toContain(service.current());
  });

  it('switches Transloco, the formatting locale and <html lang>, and persists the choice', () => {
    storage.setItem(`${STORAGE_PREFIX}:language`, JSON.stringify('pt-BR'));
    const service = setup();
    const transloco = TestBed.inject(TranslocoService);

    service.use('en');

    expect(service.current()).toBe('en');
    expect(service.locale()).toBe('en-US');
    expect(transloco.getActiveLang()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(JSON.parse(storage.getItem(`${STORAGE_PREFIX}:language`) ?? '""')).toBe('en');
    expect(transloco.translate('nav.clients')).toBe('Clients');

    service.use('pt-BR');
    expect(service.locale()).toBe('pt-BR');
    expect(transloco.translate('nav.clients')).toBe('Clientes');
  });
});
