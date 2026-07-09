import fs from 'node:fs/promises';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { v4 as uuid } from 'uuid';
import { createPlan } from './taskPlanner.js';
import {
  detectCaptcha,
  normalizeItems,
  safeClick,
  safeType,
  sanitizeFilename,
  scrollPage
} from '../utils/browserHelpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageRoot = path.resolve(__dirname, '../server/storage');
const screenshotDir = path.join(storageRoot, 'screenshots');
const downloadDir = path.join(storageRoot, 'downloads');

function now() {
  return new Date().toISOString();
}

function demoFormHtml(mode = 'registration') {
  const isAppointment = mode === 'appointment';
  return `<!doctype html>
  <html>
    <head>
      <title>${isAppointment ? 'Demo Appointment' : 'Demo Registration'}</title>
      <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #07110d; color: #e9fff4; font-family: Arial, sans-serif; }
        form { width: min(520px, 92vw); border: 1px solid rgba(57,255,156,.32); background: rgba(255,255,255,.06); padding: 28px; border-radius: 10px; }
        label { display: block; margin-top: 14px; color: #94f7c5; }
        input, select, textarea { width: 100%; margin-top: 6px; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.18); background: #091611; color: white; }
        button { margin-top: 18px; width: 100%; border: 0; border-radius: 8px; padding: 13px; background: #39ff9c; color: #020805; font-weight: 700; }
        #result { margin-top: 16px; color: #39ff9c; font-weight: 700; }
      </style>
    </head>
    <body>
      <form onsubmit="event.preventDefault(); document.querySelector('#result').textContent='${isAppointment ? 'Appointment booked for demo review.' : 'Registration completed successfully.'}';">
        <h1>${isAppointment ? 'Book Demo Appointment' : 'Registration Form'}</h1>
        <label>Full name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Phone<input name="phone" required /></label>
        ${isAppointment ? '<label>Service<select name="service"><option>AI automation demo</option><option>Product consultation</option></select></label><label>Date<input name="date" type="date" required /></label>' : '<label>Role<select name="role"><option>Developer</option><option>Founder</option><option>Researcher</option></select></label>'}
        <label>Notes<textarea name="notes"></textarea></label>
        <button type="submit">${isAppointment ? 'Book Appointment' : 'Create Account'}</button>
        <div id="result"></div>
      </form>
    </body>
  </html>`;
}

export class PlaywrightAgentService extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.sessions = new Map();
  }

  listTasks() {
    return [...this.tasks.values()]
      .sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0))
      .map((task) => this.publicTask(task));
  }

  getTask(id) {
    const task = this.tasks.get(id);
    if (!task) return null;
    return this.publicTask(task);
  }

  publicTask(task) {
    return JSON.parse(JSON.stringify({
      id: task.id,
      command: task.command,
      status: task.status,
      progress: task.progress,
      currentUrl: task.currentUrl,
      currentAction: task.currentAction,
      plan: task.plan,
      logs: task.logs,
      result: task.result,
      screenshot: task.screenshot,
      startedAt: task.startedAt,
      finishedAt: task.finishedAt
    }));
  }

  createTask(command, options = {}) {
    const task = {
      id: uuid(),
      command,
      options,
      status: 'queued',
      progress: 2,
      currentUrl: 'about:blank',
      currentAction: 'Queued',
      plan: [],
      logs: [],
      result: null,
      screenshot: null,
      downloads: [],
      startedAt: now(),
      finishedAt: null,
      aborted: false
    };
    this.tasks.set(task.id, task);
    this.emitUpdate(task);
    this.execute(task).catch((error) => this.failTask(task, error));
    return this.publicTask(task);
  }

  replayTask(id) {
    const task = this.tasks.get(id);
    if (!task) return null;
    return this.createTask(task.command, task.options);
  }

  async stopTask(id) {
    const task = this.tasks.get(id);
    if (!task) return null;
    task.aborted = true;
    task.status = 'failed';
    task.currentAction = 'Stopped by user';
    task.finishedAt = now();
    await this.sessions.get(id)?.browser?.close().catch(() => {});
    this.sessions.delete(id);
    this.log(task, 'Task stopped by user.', 'warn');
    this.emitUpdate(task);
    return this.publicTask(task);
  }

  log(task, message, level = 'info') {
    task.logs.push({ id: uuid(), time: now(), level, message });
  }

  setStep(task, index, status, detail) {
    if (!task.plan[index]) return;
    task.plan[index] = { ...task.plan[index], status, detail };
    const completed = task.plan.filter((step) => step.status === 'completed').length;
    task.progress = Math.min(96, Math.round((completed / Math.max(task.plan.length, 1)) * 100));
  }

  emitUpdate(task) {
    this.emit('task:update', {
      taskId: task.id,
      task: this.publicTask(task)
    });
  }

  async screenshot(task, page, label) {
    await fs.mkdir(screenshotDir, { recursive: true });
    const filename = `${task.id}-${sanitizeFilename(label)}-${Date.now()}.png`;
    const filePath = path.join(screenshotDir, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    const buffer = await fs.readFile(filePath);
    task.screenshot = {
      label,
      url: `/screenshots/${filename}`,
      dataUrl: `data:image/png;base64,${buffer.toString('base64')}`,
      createdAt: now()
    };
    task.result = task.result || {};
    task.result.screenshots = [...(task.result.screenshots || []), task.screenshot.url];
  }

  async execute(task) {
    await fs.mkdir(downloadDir, { recursive: true });
    task.status = 'planning';
    task.currentAction = 'Planning task';
    this.log(task, `Received command: ${task.command}`);
    this.emitUpdate(task);

    const plan = await createPlan(task.command, (message, level) => this.log(task, message, level));
    task.plan = plan.steps;
    task.currentAction = `Planned ${task.plan.length} browser actions`;
    this.emitUpdate(task);

    const started = Date.now();
    let browser;
    let context;
    let page;

    try {
      browser = await chromium.launch({
        headless: String(process.env.HEADLESS || 'false') === 'true',
        slowMo: Number(process.env.BROWSER_SLOW_MO || 60),
        args: ['--disable-blink-features=AutomationControlled']
      });
      context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        acceptDownloads: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 WebPilotAI/1.0'
      });
      page = await context.newPage();
      this.sessions.set(task.id, { browser, context, page });

      page.on('dialog', async (dialog) => {
        this.log(task, `Dialog detected: ${dialog.message()}`, 'warn');
        await dialog.dismiss().catch(() => {});
      });
      page.on('download', async (download) => {
        const filename = download.suggestedFilename();
        const savePath = path.join(downloadDir, `${task.id}-${filename}`);
        await download.saveAs(savePath);
        task.downloads.push(savePath);
        this.log(task, `Downloaded ${filename}`);
      });

      task.status = 'running';
      await this.performPlan(task, page, plan);

      const completed = task.plan.filter((step) => step.status === 'completed').length;
      task.status = task.status === 'needs_user' ? 'needs_user' : 'completed';
      task.progress = task.status === 'completed' ? 100 : task.progress;
      task.currentAction = task.status === 'completed' ? 'Task completed' : task.currentAction;
      task.finishedAt = now();
      task.result = {
        ...task.result,
        executionTimeMs: Date.now() - started,
        successRate: Math.round((completed / Math.max(task.plan.length, 1)) * 100),
        downloads: task.downloads
      };
      this.log(task, `Finished with status ${task.status}.`);
      this.emitUpdate(task);
    } catch (error) {
      await this.failTask(task, error, Date.now() - started);
    } finally {
      await browser?.close().catch(() => {});
      this.sessions.delete(task.id);
    }
  }

  async failTask(task, error, executionTimeMs = 0) {
    task.status = task.aborted ? 'failed' : 'failed';
    task.currentAction = error.message;
    task.finishedAt = now();
    task.result = {
      ...task.result,
      summary: task.result?.summary || `The task failed: ${error.message}`,
      executionTimeMs,
      successRate: Math.round((task.plan.filter((step) => step.status === 'completed').length / Math.max(task.plan.length, 1)) * 100),
      items: task.result?.items || []
    };
    const runningIndex = task.plan.findIndex((step) => step.status === 'running');
    if (runningIndex >= 0) this.setStep(task, runningIndex, 'failed', error.message);
    this.log(task, error.stack || error.message, 'error');
    this.emitUpdate(task);
  }

  async guardedStep(task, page, index, label, handler) {
    if (task.aborted) throw new Error('Task aborted');
    if (task.status === 'needs_user') return;
    task.currentAction = label;
    this.setStep(task, index, 'running', 'In progress');
    this.emitUpdate(task);

    let attempt = 0;
    while (attempt < 2) {
      try {
        attempt += 1;
        await handler();
        task.currentUrl = page.url();
        if (await detectCaptcha(page)) {
          task.status = 'needs_user';
          task.currentAction = 'CAPTCHA or human verification detected. Please solve it in the browser window, then replay or continue manually.';
          this.log(task, 'Human verification detected. The agent will not bypass CAPTCHA.', 'warn');
          this.setStep(task, index, 'failed', 'Needs manual verification');
          await this.screenshot(task, page, label).catch(() => {});
          this.emitUpdate(task);
          throw new Error('Manual verification required.');
        }
        await this.screenshot(task, page, label).catch((error) => this.log(task, `Screenshot skipped: ${error.message}`, 'warn'));
        this.setStep(task, index, 'completed', 'Done');
        this.emitUpdate(task);
        return;
      } catch (error) {
        if (task.status === 'needs_user') return;
        this.log(task, `Step retry ${attempt}/2 for "${label}": ${error.message}`, attempt === 2 ? 'error' : 'warn');
        if (attempt >= 2) throw error;
        await page.waitForTimeout(1200);
      }
    }
  }

  async performPlan(task, page, plan) {
    if (['form_fill', 'appointment'].includes(plan.intent)) {
      await this.runDemoForm(task, page, plan.intent);
    } else if (plan.intent === 'youtube_search') {
      await this.runYouTube(task, page, plan.query);
    } else if (plan.intent === 'github_search') {
      await this.runGitHub(task, page, plan.query);
    } else if (plan.intent === 'wikipedia_lookup') {
      await this.runWikipedia(task, page, plan.query);
    } else if (plan.intent === 'headlines') {
      await this.runHeadlines(task, page, plan.query);
    } else if (plan.intent === 'product_search') {
      await this.runProductSearch(task, page, plan);
    } else {
      await this.runGoogleSearch(task, page, plan.query, plan.intent);
    }
  }

  async runGoogleSearch(task, page, query, intent = 'google_search') {
    await this.guardedStep(task, page, 0, 'Open Google', async () => {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });
    if (task.status === 'needs_user') return;

    await this.guardedStep(task, page, 1, 'Search query', async () => {
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
      await scrollPage(page, (message, level) => this.log(task, message, level), 650);
    });

    await this.guardedStep(task, page, 2, 'Extract results', async () => {
      const items = await this.extractGenericResults(page);
      task.result = {
        ...task.result,
        items,
        summary: this.summarize(query, intent, items)
      };
      this.log(task, `Extracted ${items.length} result rows.`);
    });

    await this.guardedStep(task, page, 3, 'Summarize findings', async () => {
      task.result.summary = this.summarize(query, intent, task.result.items);
    });
  }

  async runYouTube(task, page, query) {
    await this.guardedStep(task, page, 0, 'Open YouTube', async () => {
      await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });
    await this.guardedStep(task, page, 1, 'Search videos', async () => {
      await page.waitForSelector('ytd-video-renderer, ytd-rich-item-renderer, a#video-title', { timeout: 12000 });
      await scrollPage(page, (message, level) => this.log(task, message, level), 900);
    });
    await this.guardedStep(task, page, 2, 'Extract video results', async () => {
      const items = await page.$$eval('a#video-title', (nodes) => nodes.slice(0, 10).map((node) => ({
        title: node.textContent.trim(),
        url: node.href,
        source: 'YouTube'
      })));
      task.result = { ...task.result, items: normalizeItems(items), summary: this.summarize(query, 'youtube_search', items) };
    });
    await this.guardedStep(task, page, 3, 'Summarize findings', async () => {});
  }

  async runGitHub(task, page, query) {
    await this.guardedStep(task, page, 0, 'Open GitHub', async () => {
      await page.goto(`https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });
    await this.guardedStep(task, page, 1, 'Search repositories', async () => {
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
      await scrollPage(page, (message, level) => this.log(task, message, level), 750);
    });
    await this.guardedStep(task, page, 2, 'Extract repository cards', async () => {
      const items = await page.$$eval('[data-testid="results-list"] a[href*="/"], div.search-title a, a.v-align-middle', (nodes) => nodes.slice(0, 12).map((node) => ({
        repository: node.textContent.trim(),
        url: node.href,
        source: 'GitHub'
      })));
      task.result = { ...task.result, items: normalizeItems(items), summary: this.summarize(query, 'github_search', items) };
    });
    await this.guardedStep(task, page, 3, 'Summarize findings', async () => {});
  }

  async runWikipedia(task, page, query) {
    await this.guardedStep(task, page, 0, 'Open Wikipedia', async () => {
      await page.goto(`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });
    await this.guardedStep(task, page, 1, 'Search article', async () => {
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    });
    await this.guardedStep(task, page, 2, 'Read article sections', async () => {
      const title = await page.locator('h1').first().textContent().catch(() => query);
      const paragraphs = await page.$$eval('p', (nodes) => nodes.slice(0, 6).map((node) => node.textContent.trim()).filter(Boolean));
      const headings = await page.$$eval('h2, h3', (nodes) => nodes.slice(0, 8).map((node) => node.textContent.trim()).filter(Boolean));
      const items = normalizeItems([
        { title, type: 'Article title', source: 'Wikipedia' },
        ...headings.map((heading) => ({ heading, source: 'Wikipedia' }))
      ]);
      task.result = {
        ...task.result,
        items,
        summary: paragraphs.slice(0, 3).join(' ') || this.summarize(query, 'wikipedia_lookup', items)
      };
    });
    await this.guardedStep(task, page, 3, 'Summarize page', async () => {});
  }

  async runHeadlines(task, page, query) {
    await this.guardedStep(task, page, 0, 'Open news search', async () => {
      await page.goto(`https://news.google.com/search?q=${encodeURIComponent(query || 'technology')}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    });
    await this.guardedStep(task, page, 1, 'Search topic', async () => {
      await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
      await scrollPage(page, (message, level) => this.log(task, message, level), 850);
    });
    await this.guardedStep(task, page, 2, 'Collect headlines', async () => {
      const items = await page.$$eval('article a[href]', (nodes) => nodes.slice(0, 14).map((node) => ({
        headline: node.textContent.trim(),
        url: node.href,
        source: 'Google News'
      })));
      task.result = { ...task.result, items: normalizeItems(items), summary: this.summarize(query, 'headlines', items) };
    });
    await this.guardedStep(task, page, 3, 'Summarize headlines', async () => {});
  }

  async runProductSearch(task, page, plan) {
    const query = plan.query || task.command;
    const url = plan.marketplace === 'Amazon'
      ? `https://www.amazon.in/s?k=${encodeURIComponent(query)}`
      : plan.marketplace === 'Flipkart'
        ? `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`
        : `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    await this.guardedStep(task, page, 0, `Open ${plan.marketplace || 'Google'}`, async () => {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    });
    await this.guardedStep(task, page, 1, 'Search products', async () => {
      await page.waitForLoadState('networkidle', { timeout: 14000 }).catch(() => {});
      await scrollPage(page, (message, level) => this.log(task, message, level), 1000);
    });
    await this.guardedStep(task, page, 2, 'Extract product candidates', async () => {
      const html = await page.content();
      const $ = cheerio.load(html);
      let items = [];

      if (plan.marketplace === 'Amazon') {
        items = $('[data-component-type="s-search-result"]').slice(0, 10).map((_, el) => ({
          title: $(el).find('h2 span').first().text(),
          price: $(el).find('.a-price-whole').first().text(),
          rating: $(el).find('.a-icon-alt').first().text(),
          source: 'Amazon'
        })).get();
      } else if (plan.marketplace === 'Flipkart') {
        items = $('a[href*="/p/"], div[data-id]').slice(0, 10).map((_, el) => ({
          title: $(el).find('div, span').first().text(),
          price: $(el).find('div:contains("₹")').first().text(),
          source: 'Flipkart'
        })).get();
      }

      if (!items.length) items = await this.extractGenericResults(page);
      task.result = { ...task.result, items: normalizeItems(items), summary: this.summarize(query, 'product_search', items) };
    });
    await this.guardedStep(task, page, 3, 'Rank and summarize', async () => {});
  }

  async runDemoForm(task, page, mode) {
    await this.guardedStep(task, page, 0, mode === 'appointment' ? 'Open appointment form' : 'Open demo form', async () => {
      await page.setContent(demoFormHtml(mode), { waitUntil: 'domcontentloaded' });
    });
    await this.guardedStep(task, page, 1, mode === 'appointment' ? 'Choose service and date' : 'Fill required fields', async () => {
      await safeType(page, 'input[name="name"]', 'Vaish Demo User', (message, level) => this.log(task, message, level));
      await safeType(page, 'input[name="email"]', 'vaish.demo@example.com', (message, level) => this.log(task, message, level));
      await safeType(page, 'input[name="phone"]', '+91 98765 43210', (message, level) => this.log(task, message, level));
      if (mode === 'appointment') await safeType(page, 'input[name="date"]', '2026-07-15', (message, level) => this.log(task, message, level));
      await safeType(page, 'textarea[name="notes"]', 'Submitted by WebPilot AI autonomous browser agent.', (message, level) => this.log(task, message, level));
    });
    await this.guardedStep(task, page, 2, 'Submit form', async () => {
      await safeClick(page, 'button[type="submit"]', (message, level) => this.log(task, message, level));
    });
    await this.guardedStep(task, page, 3, 'Verify confirmation', async () => {
      const confirmation = await page.locator('#result').textContent();
      task.result = {
        ...task.result,
        items: [{ field: 'confirmation', value: confirmation }],
        summary: confirmation
      };
    });
  }

  async extractGenericResults(page) {
    const items = await page.$$eval('a[href]', (nodes) => {
      const seen = new Set();
      return nodes.map((node) => ({
        title: node.innerText || node.textContent || '',
        url: node.href,
        source: new URL(node.href).hostname.replace(/^www\./, '')
      }))
        .filter((item) => item.title.trim().length > 12 && item.url.startsWith('http'))
        .filter((item) => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        })
        .slice(0, 12);
    });

    return normalizeItems(items);
  }

  summarize(query, intent, items = []) {
    const count = items.length;
    const names = items.slice(0, 4).map((item) => item.title || item.headline || item.repository || item.heading || item.price).filter(Boolean);
    if (intent === 'weather') return `Weather search for "${query}" completed with ${count} extracted page signals.`;
    if (intent === 'compare') return `Comparison search for "${query}" completed. Top signals include ${names.join(', ') || 'the extracted result set'}.`;
    if (intent === 'product_search') return `Product search for "${query}" found ${count} candidates. Review prices and links before purchasing.`;
    if (intent === 'youtube_search') return `YouTube search for "${query}" found ${count} video candidates.`;
    if (intent === 'github_search') return `GitHub repository search for "${query}" found ${count} repository candidates.`;
    return `Search for "${query}" completed with ${count} extracted results.`;
  }
}
