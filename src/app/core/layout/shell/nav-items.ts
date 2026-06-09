import { IconName } from '../../../shared/ui/icon/icons';

export interface NavItem {
  readonly path: string;
  /** Translation key of the label. */
  readonly label: string;
  readonly icon: IconName;
  readonly exact?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'nav.dashboard', icon: 'dashboard', exact: true },
  { path: '/clients', label: 'nav.clients', icon: 'users' },
];
