// The showcase's pages, in nav order. The Vite config also builds one HTML entry for each.
export const PAGES = [
  { id: 'home', label: 'Home', icon: 'house', path: '' },
  { id: 'colors', label: 'Colors', icon: 'palette', path: 'colors/' },
  { id: 'charts', label: 'Charts', icon: 'chart-column', path: 'charts/' },
  { id: 'components', label: 'Components', icon: 'toggle-right', path: 'components/' },
  { id: 'layout', label: 'Layout', icon: 'panel-left', path: 'layout/' },
  { id: 'icons', label: 'Icons', icon: 'shapes', path: 'icons/' },
  { id: 'sizing', label: 'Sizing', icon: 'ruler', path: 'sizing/' },
] as const;

// The page templates in templates/, each with its own page under layout/.
export const TEMPLATES = [
  { id: 'data-table', label: 'Data table' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'detail', label: 'Detail' },
  { id: 'form', label: 'Form' },
  { id: 'settings', label: 'Settings' },
  { id: 'sign-in', label: 'Sign-in' },
] as const;

export type PageId = (typeof PAGES)[number]['id'];
