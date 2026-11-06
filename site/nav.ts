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
  { id: 'data-table', label: 'Data table', category: 'Records', description: 'Search, filter and select records, with bulk actions and pagination.', reference: '' },
  { id: 'dashboard', label: 'Dashboard', category: 'Overview', description: 'Track key figures, chart trends and review recent records.', reference: '' },
  { id: 'detail', label: 'Detail', category: 'Records', description: 'Inspect a record with status, contextual actions and related information.', reference: '' },
  { id: 'form', label: 'Form', category: 'Forms', description: 'Create or edit a record with grouped fields and clear validation.', reference: '' },
  { id: 'settings', label: 'Settings', category: 'Forms', description: 'Manage preferences with section navigation, grouped options and a danger zone.', reference: '' },
  { id: 'sign-in', label: 'Sign-in', category: 'Account', description: 'A focused sign-in screen outside the application shell.', reference: '' },
  { id: 'news-hub', label: 'News and resources hub', category: 'Content', description: 'A featured story, recent updates and quick links bring company knowledge together.', reference: 'https://ai.oestergaard-as.dk' },
  { id: 'app-catalog', label: 'App catalog', category: 'Discovery', description: 'Find internal apps with search and source filters, then pin frequently used tools.', reference: 'https://it.oestergaard-as.dk/apps' },
  { id: 'chat-landing', label: 'Chat landing', category: 'Chat', description: 'Start with a suggested question or your own prompt, with recent work close at hand.', reference: 'https://oe-production-planner.ashygrass-43a44b75.northeurope.azurecontainerapps.io/reports/new?fresh=1' },
  { id: 'chat-workspace', label: 'Chat/report workspace', category: 'Chat', description: 'Work through a conversation beside its report, with tool activity and a persistent composer.', reference: 'https://oe-production-planner.ashygrass-43a44b75.northeurope.azurecontainerapps.io/reports/new?fresh=1' },
  { id: 'comparison', label: 'Comparison table', category: 'Data', description: 'Compare candidates across grouped criteria, with pinned labels and best-value highlights.', reference: 'https://astryx.atmeta.com/templates?preview=table-comparison' },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];

export type PageId = (typeof PAGES)[number]['id'];
