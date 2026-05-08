import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { characters, getCharacter, getPortrait } from '../../src/characters/index.js';

const PUBLIC = path.join(process.cwd(), 'public');

describe('character registry', () => {
  it('has the 11 Phase 3+4+5 hosts', () => {
    expect(Object.keys(characters).sort()).toEqual(
      ['blathers', 'celeste', 'cj', 'cyrus', 'daisy-mae', 'flick', 'isabelle', 'kk-slider', 'leif', 'tom-nook', 'tommy-timmy']
    );
  });

  it('every character has at least one portrait file on disk', () => {
    for (const c of Object.values(characters)) {
      for (const url of Object.values(c.portraits)) {
        const file = path.join(PUBLIC, url.replace(/^\//, ''));
        expect(fs.existsSync(file), `missing portrait: ${file}`).toBe(true);
      }
    }
  });

  it('getPortrait falls back to defaultMood', () => {
    expect(getPortrait('isabelle')).toBe('/island/characters/isabelle-welcome.webp');
    expect(getPortrait('isabelle', 'thinking')).toBe('/island/characters/isabelle-thinking.webp');
  });

  it('getCharacter throws on unknown id', () => {
    expect(() => getCharacter('villager-x')).toThrow(/Unknown character/);
  });
});
