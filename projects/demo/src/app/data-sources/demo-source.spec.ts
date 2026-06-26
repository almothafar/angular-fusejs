import { readPath, valueAt } from './demo-source';

describe('readPath', () => {
  const record = {
    name: { common: 'Jordan', official: 'Hashemite Kingdom of Jordan' },
    capital: ['Amman'],
    region: 'Asia',
  };

  it('reads a nested dotted path', () => {
    expect(readPath(record, 'name.common')).toBe('Jordan');
    expect(readPath(record, 'name.official')).toBe('Hashemite Kingdom of Jordan');
  });

  it('reads a top-level path', () => {
    expect(readPath(record, 'region')).toBe('Asia');
  });

  it('returns arrays unchanged', () => {
    expect(readPath(record, 'capital')).toEqual(['Amman']);
  });

  it('returns undefined for missing paths', () => {
    expect(readPath(record, 'name.native')).toBeUndefined();
    expect(readPath(record, 'nope.deep.path')).toBeUndefined();
  });
});

describe('valueAt', () => {
  const record = { name: { common: 'Jordan' }, capital: ['Amman', 'Other'], nothing: null };

  it('stringifies a nested value', () => {
    expect(valueAt(record, 'name.common')).toBe('Jordan');
  });

  it('joins arrays with ", "', () => {
    expect(valueAt(record, 'capital')).toBe('Amman, Other');
  });

  it('returns "" for null or missing values', () => {
    expect(valueAt(record, 'nothing')).toBe('');
    expect(valueAt(record, 'missing.path')).toBe('');
  });
});
