import { describe, expect, it } from 'vitest';
import { layoutForWidth } from './tokens';

describe('layoutForWidth', () => {
  it('splits at 700 and 1100', () => {
    expect(layoutForWidth(699)).toBe('phone');
    expect(layoutForWidth(700)).toBe('tablet');
    expect(layoutForWidth(1099)).toBe('tablet');
    expect(layoutForWidth(1100)).toBe('laptop');
  });
});
