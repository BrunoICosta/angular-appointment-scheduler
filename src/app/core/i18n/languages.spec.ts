import { detectLanguage } from './languages';

describe('detectLanguage', () => {
  it('prefers the saved choice over the browser', () => {
    expect(detectLanguage('en', ['pt-BR'])).toBe('en');
    expect(detectLanguage('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('maps any Portuguese browser language to pt-BR', () => {
    expect(detectLanguage(null, ['pt-BR'])).toBe('pt-BR');
    expect(detectLanguage(null, ['pt-PT', 'en'])).toBe('pt-BR');
    expect(detectLanguage(null, ['pt'])).toBe('pt-BR');
  });

  it('falls back to English for any other browser language', () => {
    expect(detectLanguage(null, ['en-GB'])).toBe('en');
    expect(detectLanguage(null, ['fr-FR', 'pt-BR'])).toBe('en');
  });

  it('ignores unsupported saved values', () => {
    expect(detectLanguage('es', ['en-US'])).toBe('en');
  });

  it('defaults to pt-BR when nothing is known', () => {
    expect(detectLanguage(undefined, [])).toBe('pt-BR');
    expect(detectLanguage(undefined, [''])).toBe('pt-BR');
  });
});
