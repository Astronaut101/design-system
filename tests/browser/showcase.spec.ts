import { test, expect } from '@playwright/test';
import { TEMPLATES } from '../../site/nav.ts';

const category = (name: string) => `#category-${name.toLowerCase().replaceAll(' ', '-')}`;

test('gallery previews preserve focus, theme and viewport controls', async ({ page }) => {
  await page.goto('layout/');
  await expect(page.locator('[data-preview]')).toHaveCount(11);
  const trigger = page.getByRole('button', {name:'Preview Dashboard', exact:true});
  await trigger.click();
  const dialog = page.getByRole('dialog', {name:'Dashboard', exact:true});
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/preview=dashboard/);
  await expect(dialog.getByText('Track key figures', {exact:false})).toBeVisible();
  await expect(page.locator('#preview-frame')).toHaveAttribute('title', 'Dashboard interactive preview');
  await dialog.getByRole('button', {name:'Phone', exact:true}).click();
  await expect(page.locator('#preview-frame')).toHaveAttribute('width', '390');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', {name:'Dark theme', exact:true}).click();
  await trigger.click();
  await expect.poll(() => page.frameLocator('#preview-frame').locator('html').getAttribute('data-theme')).toBe('dark');
  await dialog.getByRole('button', {name:'Desktop',exact:true}).click();
  await page.frameLocator('#preview-frame').getByRole('button', {name:'Toggle sidebar'}).focus();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('preview links survive refresh and Back/Forward; unknown ids are harmless', async ({ page }) => {
  await page.goto('layout/?preview=app-catalog');
  await expect(page.getByRole('dialog', {name:'App catalog', exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('dialog', {name:'App catalog', exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Close preview', exact:true}).click();
  await expect(page).not.toHaveURL(/preview=/);
  await page.getByRole('button', {name:'Preview Comparison table', exact:true}).click();
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goForward();
  await expect(page.getByRole('dialog', {name:'Comparison table', exact:true})).toBeVisible();
  await page.goto('layout/?preview=unknown');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('modal traps focus and HTML copying reports failure locally', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText:async () => {throw new Error('blocked');}}}));
  await page.goto('layout/?preview=news-hub');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', {name:'Copy HTML'}).click();
  await expect(dialog.getByRole('status')).toContainText('Copy is blocked');
  await dialog.getByRole('button', {name:'Open full page'}).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', {name:'Close preview'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', {name:'Open full page'})).toBeFocused();
});

test('template HTML copy uses the source rather than rendered iframe content', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText:async (text: string) => {document.documentElement.dataset.copied = text;}}}));
  await page.goto('layout/?preview=comparison');
  await page.getByRole('button', {name:'Copy HTML'}).click();
  await expect(page.locator('#preview-status')).toHaveText('HTML copied to clipboard');
  await expect(page.locator('html')).toHaveAttribute('data-copied', /<!doctype html>[\s\S]*oe-comparison/);
});

test('library keeps all samples and opens focused examples inside the OE shell', async ({ page }) => {
  await page.goto('components/');
  await expect(page.locator('.component-category')).toHaveCount(9);
  await expect(page.locator('[data-library-tile]')).toHaveCount(53);
  await expect(page.getByRole('navigation', {name:'Pages',exact:true})).toBeVisible();
  await expect(page.locator('#buttons')).not.toBeVisible();
  await page.getByRole('button', {name:'View Buttons',exact:true}).click();
  await expect(page.locator('#buttons')).toBeVisible();
  await expect(page.locator('[data-detail-title]')).toHaveText('Buttons');
  await expect(page.locator('.component-example:not([hidden])')).toHaveCount(1);
  await page.getByRole('button', {name:'All components',exact:true}).click();
  await expect(page.locator('#component-overview')).toBeVisible();
  await expect(page.getByRole('button', {name:'View Buttons',exact:true})).toBeFocused();
  await page.getByRole('button', {name:'Collapse all'}).click();
  await expect(page.locator('.component-category[open]')).toHaveCount(0);
  await page.getByRole('button', {name:'Expand all'}).click();
  await expect(page.locator('.component-category[open]')).toHaveCount(9);
  await expect(page.locator(`${category('Chat')} [data-library-tile]`)).toHaveCount(15);
  for (const [id,title] of [['table','Table'],['stats','Stats'],['chat-tool-calls','Chat tool calls']]) {
    await page.goto(`components/#${id}`);
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator('[data-detail-title]')).toHaveText(title);
  }
});

test('tokenizer supports creation, duplicate feedback, limits and removal', async ({ page }) => {
  await page.goto('components/#tokenizer');
  const demo = page.locator('#tokenizer');
  const input = demo.getByRole('combobox', {name:'Add project tag'});
  await input.fill('Planning'); await input.press('Enter');
  await expect(demo.getByRole('status')).toHaveText('That tag is already selected.');
  await input.fill('Finance'); await input.press('Enter');
  await input.fill('People'); await demo.getByRole('button', {name:'Add tag', exact:true}).click();
  await expect(input).toBeDisabled();
  await demo.getByRole('button', {name:'Remove Finance', exact:true}).click();
  await expect(input).toBeEnabled();
  await expect(input).toBeFocused();
  await demo.getByRole('button', {name:'Clear all', exact:true}).click();
  await expect(demo.getByRole('status')).toHaveText('0 of 3 selected');
});

test('structured filters combine and clear without network requests', async ({ page }) => {
  await page.goto('components/#power-search');
  const demo = page.locator('#power-search');
  await expect(demo.locator('[data-result-count]')).toHaveText('4 results');
  await demo.getByRole('combobox', {name:'Value', exact:true}).fill('Open');
  await demo.getByRole('button', {name:'Add filter'}).click();
  await expect(demo.locator('[data-result-count]')).toHaveText('2 results');
  await demo.getByRole('searchbox').fill('no-such-report');
  await expect(demo.getByRole('cell', {name:'No results. Try removing a filter.'})).toBeVisible();
  await demo.getByRole('button', {name:'Remove filter 1'}).click();
  await demo.getByRole('button', {name:'Clear all', exact:true}).click();
  await expect(demo.locator('[data-result-count]')).toHaveText('4 results');
});

test('catalog filtering and pins work on the standalone template', async ({ page }) => {
  await page.goto('layout/app-catalog/');
  await page.getByRole('searchbox', {name:'Search apps'}).fill('capacity');
  await expect(page.locator('[data-catalog-count]')).toHaveText('1 app');
  await page.getByRole('button', {name:'Pin Capacity planner', exact:true}).click();
  await expect(page.locator('[data-name="Capacity planner"]')).toHaveAttribute('data-pinned', 'true');
  await page.getByRole('combobox', {name:'Category', exact:true}).selectOption('Finance');
  await expect(page.getByRole('heading', {name:'No apps found'})).toBeVisible();
  await page.locator('[data-catalog-clear]').first().click();
  await expect(page.locator('[data-catalog-count]')).toHaveText('6 apps');
});

test('hover cards and tooltips open with focus, stay in viewport and dismiss', async ({ page }) => {
  await page.goto('components/#hover-card');
  await page.getByRole('button', {name:'What is capacity?', exact:true}).focus();
  await expect(page.locator('#hint-definition')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hint-definition')).not.toBeVisible();
  await page.goto('components/#tooltip');
  await page.locator('#tooltip').getByRole('button', {name:'Save report', exact:true}).focus();
  await expect(page.getByRole('tooltip', {name:'Save this report to your workspace.'})).toBeVisible();
  const bounds = await page.locator('#hint-save').boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#hint-save')).not.toBeVisible();
});

test('toast expiry pauses for focus; Undo and dismissal are local', async ({ page }) => {
  await page.clock.install();
  await page.goto('components/#toast');
  const demo = page.locator('#toast');
  await demo.getByRole('button', {name:'Show success'}).click();
  const toast = demo.locator('.oe-toast');
  await toast.getByRole('button', {name:'Undo'}).focus();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6000);
  await expect(toast).toBeVisible();
  await toast.getByRole('button', {name:'Undo'}).click();
  await expect(demo.locator('[data-toast-result]')).toHaveText('Demo action undone.');
  await expect(toast).toHaveCount(0);
  await demo.getByRole('button', {name:'Show danger'}).click();
  await demo.getByRole('button', {name:'Dismiss notification'}).click();
  await expect(toast).toHaveCount(0);
  await expect(page.locator('#clipboard-toast.toast')).toHaveCount(1);
});

test('code copies without gutters and handles clipboard failure', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText:async (text: string) => {document.documentElement.dataset.copied = text;}}}));
  await page.goto('components/#code-blocks');
  await page.getByRole('button', {name:'Copy code', exact:true}).click();
  const copied = await page.locator('html').getAttribute('data-copied');
  expect(copied).toContain('const report');
  expect(copied).not.toContain('1//');
  expect(copied).not.toContain('TypeScript');
  await page.evaluate(() => {navigator.clipboard.writeText = async () => {throw new Error('blocked');};});
  await page.getByRole('button', {name:'Copy code', exact:true}).click();
  await expect(page.locator('#code-blocks [data-code-status]').first()).toContainText('Copy is blocked');
});

test('chat supports empty input, mentions, attachments, streaming and Stop', async ({ page }) => {
  await page.goto('components/#chat-layout');
  const demo = page.locator('#chat-layout');
  const send = demo.getByRole('button', {name:'Send message', exact:true});
  await expect(send).toBeDisabled();
  await demo.locator('[data-attachments] > summary').click();
  await demo.getByRole('button', {name:'Remove capacity-notes.txt'}).click();
  await expect(demo.locator('.oe-chat-attachment')).toHaveCount(0);
  await demo.getByRole('button', {name:'@ Capacity', exact:true}).click();
  await expect(demo.getByRole('button', {name:'Remove Capacity mention'})).toBeVisible();
  const input = demo.getByRole('textbox', {name:'Message the assistant'});
  await input.fill('Which work center needs review?');
  await input.press('Shift+Enter');
  await expect(input).toHaveValue('Which work center needs review?\n');
  await input.press('Enter');
  await expect(demo.getByRole('button', {name:'Stop response'})).toBeVisible();
  await demo.getByRole('button', {name:'Stop response'}).click();
  await expect(demo.locator('[data-chat-status]')).toHaveText('Response stopped');
  await expect(demo.getByRole('button', {name:'Send message'})).toBeDisabled();
  await input.fill('Try again'); await input.press('Enter');
  await expect(demo.locator('[data-chat-status]')).toHaveText('Sample response complete');
  await expect(demo.locator('[data-author="assistant"]').last()).toContainText('Assembly has the highest load at 82%');
});

test('chat landing hands a suggested prompt to the workspace', async ({ page }) => {
  await page.goto('layout/chat-landing/');
  await page.getByRole('button', {name:'Show next week’s capacity', exact:true}).click();
  await expect(page.getByRole('textbox', {name:'Message the assistant'})).toHaveValue('Show next week’s capacity');
  await page.getByRole('button', {name:'Send message'}).click();
  await expect(page).toHaveURL(/chat-workspace/);
  await expect(page.locator('[data-author="user"]').last()).toContainText('Show next week’s capacity');
});

test('chat scroll control preserves a reader inspecting earlier messages', async ({ page }) => {
  await page.goto('components/#chat-layout-scroll-button');
  const demo = page.locator('#chat-layout-scroll-button');
  for (let i = 0; i < 10; i++) await demo.getByRole('button', {name:'Add sample message'}).click();
  const thread = demo.locator('[data-chat-thread]');
  await thread.evaluate(node => {node.scrollTop = 0; node.dispatchEvent(new Event('scroll'));});
  const before = await thread.evaluate(node => node.scrollTop);
  await demo.getByRole('button', {name:'Add sample message'}).click();
  expect(await thread.evaluate(node => node.scrollTop)).toBe(before);
  const scroll = demo.getByRole('button', {name:'Latest messages ↓', exact:true});
  await expect(scroll).toBeVisible();
  await scroll.click();
  await expect(scroll).not.toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`all templates render without errors or page overflow: ${theme}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({width, height:900});
      await page.addInitScript(value => localStorage.setItem('oe-theme', value), theme);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const template of TEMPLATES) {
        await page.goto(`layout/${template.id}/`);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), template.id).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }
}

test('comparison scroll, forced colors and reduced motion remain usable', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await page.goto('layout/comparison/');
  const wrapper = page.locator('.oe-table-wrap');
  await wrapper.evaluate(node => {node.scrollLeft = 200;});
  const label = await page.getByRole('rowheader', {name:'Best for',exact:true}).boundingBox();
  const bounds = await wrapper.boundingBox();
  expect(Math.abs(label!.x - bounds!.x)).toBeLessThan(3);
  await page.getByRole('switch', {name:'Highlight best values'}).uncheck();
  await expect(page.locator('table')).toHaveAttribute('data-highlight','false');
  await expect(page.getByRole('cell', {name:'Unlimited — best value'})).toBeVisible();
});

test('isolated shell variants and navigation controls work', async ({ page }) => {
  await page.goto('components/#app-shell');
  for (const label of ['Content only','Top navigation only','Side navigation only','Top and side navigation','With banner']) {
    const frame = page.frameLocator(`iframe[title="${label} app shell"]`);
    await expect(frame.locator('h1')).toBeVisible();
  }
  const combined = page.frameLocator('iframe[title="Top and side navigation app shell"]');
  await combined.getByRole('button', {name:'Toggle sidebar'}).click();
  await expect(combined.getByRole('button', {name:'Toggle sidebar'})).toHaveAttribute('aria-expanded','false');
  await page.goto('components/#top-navigation');
  await page.locator('#top-navigation').getByRole('button', {name:'Products',exact:true}).click();
  await expect(page.getByRole('navigation', {name:'Products',exact:true})).toBeVisible();
  await page.getByRole('link', {name:'Capacity planner',exact:true}).click();
  await expect(page.locator('#navigation-destination')).toContainText('Capacity planner selected');
});

test('desktop and phone visual review artifacts', async ({ page }, testInfo) => {
  await page.goto('layout/?preview=chat-workspace');
  await expect(page.frameLocator('#preview-frame').getByRole('heading', {name:'Weekly capacity',exact:true}).first()).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('layout-preview-desktop.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button', {name:'Phone',exact:true}).click();
  await page.screenshot({path:testInfo.outputPath('layout-preview-phone.png'),animations:'disabled'});
  await page.goto('components/#chat-layout');
  await expect(page.locator('#chat-layout')).toBeInViewport();
  await page.screenshot({path:testInfo.outputPath('components-phone.png'),animations:'disabled'});
});

test('markup copying leaves the toast sample intact and ids stay unique', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText:async () => {}}}));
  await page.goto('components/#toast');
  const duplicateIds = await page.locator('[id]').evaluateAll(nodes => {
    const ids = nodes.map(node => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
  await page.locator('#toast > .sample-code > summary').click();
  await page.locator('#toast [data-copy-code]').click();
  await expect(page.locator('#clipboard-toast')).toHaveText('Copied to clipboard');
  await expect(page.locator('#toast').getByRole('button', {name:'Show success'})).toBeVisible();
});

test('closing a phone preview preserves the gallery scroll position', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('layout/');
  const trigger = page.getByRole('button', {name:'Preview Comparison table',exact:true});
  await trigger.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => document.documentElement.scrollTop);
  await trigger.click();
  await page.mouse.move(1,400);
  await page.mouse.wheel(0,-600);
  await page.getByRole('button', {name:'Close preview'}).click();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollTop)).toBe(before);
});

test('timestamp details expose labeled zones and copy the exact time', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {value:{writeText:async (value: string) => {document.documentElement.dataset.timeCopy = value;}}}));
  await page.goto('components/#timestamp');
  await page.locator('#timestamp [data-hint]').focus();
  await expect(page.locator('#timestamp-detail')).toBeVisible();
  await expect(page.locator('#timestamp-detail dt')).toHaveText(['Manila','Copenhagen','UTC']);
  await page.getByRole('button', {name:'Copy UTC',exact:true}).click();
  await expect(page.locator('[data-time-status]')).toHaveText('Exact time copied');
  await expect(page.locator('html')).toHaveAttribute('data-time-copy', /UTC/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#timestamp [data-hint]')).toBeFocused();
  await expect(page.locator('#timestamp-detail')).not.toBeVisible();
});

test('outline tracks its scroll region and dictation remains a local simulation', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('components/#outline');
  await page.getByRole('link', {name:'Review',exact:true}).click();
  await expect(page.getByRole('link', {name:'Review',exact:true})).toHaveAttribute('aria-current','location');
  await page.goto('components/#chat-dictation-button');
  const demo = page.locator('#chat-dictation-button');
  const mic = demo.getByRole('button', {name:'Simulate dictation'});
  await mic.click();
  await expect(mic).toHaveAttribute('aria-pressed','true');
  await expect(demo.locator('[data-chat-status]')).toContainText('No microphone is being used.');
  await expect(demo.getByRole('textbox')).toHaveValue('Show next week’s capacity');
  await mic.click();
  await expect(mic).toHaveAttribute('aria-pressed','false');
});

test('library search and category filters support discovery and recovery', async ({ page }) => {
  await page.goto('components/');
  await page.getByRole('button', {name:/^Chat 15$/}).click();
  await expect(page.locator('[data-library-count]')).toHaveText('15 components');
  await expect(page.locator('.component-category:not([hidden])')).toHaveCount(1);
  await page.getByRole('searchbox', {name:'Find a component'}).fill('dictation');
  await expect(page.getByRole('button', {name:'View Chat dictation button',exact:true})).toBeVisible();
  await page.getByRole('searchbox').fill('no-such-component');
  await expect(page.getByRole('heading', {name:'No components found'})).toBeVisible();
  await page.getByRole('button', {name:'Clear filters',exact:true}).click();
  await expect(page.locator('[data-library-count]')).toHaveText('53 components');
  await page.getByRole('button', {name:'View Tokenizer',exact:true}).click();
  await expect(page).toHaveURL(/#tokenizer$/);
  await page.goBack();
  await expect(page.locator('#component-overview')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#tokenizer')).toBeVisible();
});

test('preview actions are buttons and do not expose source-reference links', async ({ page, context }) => {
  await page.goto('layout/?preview=news-hub');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link')).toHaveCount(0);
  await expect(dialog.getByText('Inspiration', {exact:true})).toHaveCount(0);
  const opened = context.waitForEvent('page');
  await dialog.getByRole('button', {name:'Open full page',exact:true}).click();
  const standalone = await opened;
  await standalone.waitForLoadState();
  await expect(standalone).toHaveURL(/layout\/news-hub\/$/);
  await standalone.close();
});

test('resource buttons, app details, pinned filters and comparisons provide feedback', async ({ page }) => {
  await page.goto('layout/news-hub/');
  await page.getByRole('button', {name:'Read featured story',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('One place to prepare');
  await page.getByRole('button', {name:'Back to resources',exact:true}).click();
  await page.getByRole('button', {name:'Browse app catalog',exact:true}).click();
  await expect(page).toHaveURL(/app-catalog/);
  await page.getByRole('button', {name:'View details for Capacity planner',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Maja Holm');
  await page.getByRole('button', {name:'Done',exact:true}).click();
  await page.getByRole('button', {name:'Pin Capacity planner',exact:true}).click();
  await page.getByRole('button', {name:'Pinned only',exact:true}).click();
  await expect(page.locator('[data-catalog-count]')).toHaveText('1 app');
  await page.getByRole('button', {name:'Compare tools',exact:true}).click();
  await page.getByRole('button', {name:'Choose Summit',exact:true}).click();
  await expect(page.locator('[data-choice-status]')).toContainText('Summit selected');
});

test('workspace actions save a report and prepare a follow-up', async ({ page }) => {
  await page.goto('layout/chat-workspace/');
  await page.getByRole('button', {name:'Save report',exact:true}).click();
  await expect(page.locator('[data-report-status]')).toContainText('Weekly capacity saved');
  await expect(page.getByRole('button', {name:'Report saved',exact:true})).toBeDisabled();
  await page.getByRole('button', {name:'Ask a follow-up',exact:true}).click();
  await expect(page.getByRole('textbox', {name:'Message the assistant'})).toHaveValue('Which Assembly jobs should we review first?');
  await expect(page.getByRole('button', {name:'Send message',exact:true})).toBeEnabled();
});

test('redesigned library and templates produce review images', async ({ page }, testInfo) => {
  await page.goto('components/');
  await page.screenshot({path:testInfo.outputPath('component-library-desktop.png'),animations:'disabled'});
  for (const id of ['news-hub','app-catalog','chat-landing','chat-workspace','comparison']) {
    await page.goto(`layout/${id}/`);
    await page.screenshot({path:testInfo.outputPath(`${id}-desktop.png`),animations:'disabled'});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:testInfo.outputPath(`${id}-phone.png`),animations:'disabled'});
    await page.setViewportSize({width:1440,height:1000});
  }
  await page.goto('components/');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('component-library-phone.png'),animations:'disabled'});
});

test('phone workspace switches panels and returns to the composer for a follow-up', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('layout/chat-workspace/');
  const switcher = page.getByRole('group', {name:'Workspace view',exact:true});
  await expect(page.locator('.oe-chat-panel')).toBeVisible();
  await expect(page.getByRole('complementary', {name:'Sample capacity report'})).not.toBeVisible();
  await switcher.getByRole('button', {name:'Report',exact:true}).click();
  await expect(page.locator('.oe-chat-panel')).not.toBeVisible();
  await expect(page.getByRole('complementary', {name:'Sample capacity report'})).toBeVisible();
  await page.getByRole('button', {name:'Ask a follow-up',exact:true}).click();
  await expect(page.getByRole('textbox', {name:'Message the assistant'})).toBeFocused();
  await expect(switcher.getByRole('button', {name:'Conversation',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('product navigation stays horizontal and resource text stays within its cards', async ({ page }) => {
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.goto('layout/news-hub/');
    const links = await page.getByRole('navigation', {name:'Primary',exact:true}).locator('a').all();
    const boxes = await Promise.all(links.map(link => link.boundingBox()));
    expect(Math.max(...boxes.map(box=>box!.y)) - Math.min(...boxes.map(box=>box!.y))).toBeLessThan(2);
    expect(await page.locator('.oe-resource-option').evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth))).toBe(true);
  }
});
