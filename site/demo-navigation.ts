// Application routes in copyable HTML map to local showcase pages here.
export const DEMO_ROUTES: Record<string, string> = {
  '/': 'dashboard', '/orders':'data-table', '/orders/new':'form', '/orders/2041':'detail',
  '/settings':'settings', '/sign-in':'sign-in', '/news':'news-hub', '/apps':'app-catalog',
  '/chat':'chat-landing', '/workspace':'chat-workspace', '/compare':'comparison',
};
export function demoUrl(route: string) {
  const template = DEMO_ROUTES[route];
  return template ? new URL(`../${template}/`, location.href).href : undefined;
}
export function navigateDemo(route: string) {
  const url = demoUrl(route);
  if (url) location.assign(url);
}
