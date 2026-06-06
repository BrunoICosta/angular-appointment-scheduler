/**
 * Minimal stroke icon set (24x24 grid, inspired by Lucide, ISC licensed).
 * Each icon is a list of SVG path definitions; circles and rectangles are converted to
 * paths so the component can render everything with a single `<path>` loop.
 */

const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

const rect = (x: number, y: number, w: number, h: number, r = 0): string =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
  `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
  `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

export const ICONS = {
  dashboard: [
    rect(3, 3, 7, 9, 1),
    rect(14, 3, 7, 5, 1),
    rect(14, 12, 7, 9, 1),
    rect(3, 16, 7, 5, 1),
  ],
  calendar: [rect(3, 4, 18, 18, 2), 'M16 2v4M8 2v4M3 10h18'],
  'calendar-plus': [rect(3, 4, 18, 18, 2), 'M16 2v4M8 2v4M3 10h18M12 14v5M9.5 16.5h5'],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    circle(9, 7, 4),
    'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  ],
  briefcase: [rect(2, 7, 20, 14, 2), 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
  scissors: [
    circle(6, 6, 3),
    circle(6, 18, 3),
    'M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12',
  ],
  plus: ['M12 5v14M5 12h14'],
  pencil: ['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],
  trash: [
    'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
  ],
  x: ['M18 6 6 18M6 6l12 12'],
  sun: [
    circle(12, 12, 4),
    'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  globe: [
    circle(12, 12, 10),
    'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  ],
  search: [circle(11, 11, 8), 'm21 21-4.3-4.3'],
  clock: [circle(12, 12, 10), 'M12 6v6l4 2'],
  check: ['M20 6 9 17l-5-5'],
  alert: [circle(12, 12, 10), 'M12 8v4M12 16h.01'],
  info: [circle(12, 12, 10), 'M12 16v-4M12 8h.01'],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  mail: [rect(2, 4, 20, 16, 2), 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
  wallet: [
    'M21 12V7H5a2 2 0 0 1 0-4h14v4',
    'M3 5v14a2 2 0 0 0 2 2h16v-5',
    'M18 12a2 2 0 0 0 0 4h4v-4Z',
  ],
  inbox: [
    'M22 12h-6l-2 3h-4l-2-3H2',
    'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  ],
  reset: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  'chevron-right': ['m9 18 6-6-6-6'],
  filter: ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;
