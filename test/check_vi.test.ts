import { vi, test } from 'vitest'; test('check vi', () => { try { (vi as any).foo = 'bar'; console.log('vi is extensible'); } catch (e) { console.log('vi is NOT extensible', e); } });
