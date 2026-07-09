export function sanitizeFilename(value) {
  return String(value || 'task')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'task';
}

export async function safeClick(page, selectors, log, options = {}) {
  const candidates = Array.isArray(selectors) ? selectors : [selectors];
  let lastError;

  for (const selector of candidates) {
    try {
      const locator = page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: options.timeout || 3500 });
      await locator.click({ timeout: options.timeout || 3500 });
      log?.(`Clicked ${selector}`);
      return true;
    } catch (error) {
      lastError = error;
      log?.(`Selector unavailable: ${selector}`, 'warn');
    }
  }

  throw lastError || new Error('No clickable selector matched.');
}

export async function safeType(page, selectors, value, log, options = {}) {
  const candidates = Array.isArray(selectors) ? selectors : [selectors];
  let lastError;

  for (const selector of candidates) {
    try {
      const locator = page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: options.timeout || 3500 });
      await locator.fill(value, { timeout: options.timeout || 3500 });
      log?.(`Typed into ${selector}`);
      return true;
    } catch (error) {
      lastError = error;
      log?.(`Input unavailable: ${selector}`, 'warn');
    }
  }

  throw lastError || new Error('No input selector matched.');
}

export async function scrollPage(page, log, distance = 900) {
  await page.mouse.wheel(0, distance);
  await page.waitForTimeout(700);
  log?.(`Scrolled ${distance}px`);
}

export async function detectCaptcha(page) {
  const url = page.url().toLowerCase();
  const text = (await page.locator('body').textContent({ timeout: 1500 }).catch(() => '')).toLowerCase();
  const frames = page.frames().map((frame) => frame.url().toLowerCase()).join(' ');
  return /captcha|recaptcha|hcaptcha|challenge|verify you are human/.test(`${url} ${text} ${frames}`);
}

export function normalizeItems(items = []) {
  return items
    .filter(Boolean)
    .map((item) => Object.fromEntries(
      Object.entries(item)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
        .map(([key, value]) => [key, String(value).replace(/\s+/g, ' ').trim()])
    ))
    .filter((item) => Object.keys(item).length > 0);
}
