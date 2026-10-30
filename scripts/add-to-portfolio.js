#!/usr/bin/env node
// Usage: npm run add_to_portfolio <url> [-- --title "..." --category "..." --description "..." --slug name]
// Captures the three screenshots into html/images/portfolio/ and appends an entry to portfolioItems in html/js/portfolio.js.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const PORTFOLIO_JS = path.join(ROOT, 'html', 'js', 'portfolio.js');
const IMG_DIR = path.join(ROOT, 'html', 'images', 'portfolio');

const VARIANTS = [
    { suffix: '', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, quality: 80 },
    { suffix: '-640', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5, quality: 82 },
    { suffix: '-mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, quality: 80, isMobile: true, hasTouch: true },
];

function fail(msg) {
    console.error(`Error: ${msg}`);
    process.exit(1);
}

function parseArgs(argv) {
    const opts = {};
    const positional = [];
    for (let i = 0; i < argv.length; i++) {
        const m = argv[i].match(/^--([\w-]+)(?:=(.*))?$/);
        if (!m) { positional.push(argv[i]); continue; }
        opts[m[1]] = m[2] !== undefined ? m[2] : argv[++i];
    }
    return { url: positional[0], opts };
}

// Values end up in innerHTML on the site, so drop markup characters and collapse whitespace.
function clean(text) {
    return String(text || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function jsString(text) {
    return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function slugFromUrl(url) {
    return url.hostname.replace(/^www\./, '').split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function appendItem(source, item) {
    const start = source.indexOf('const portfolioItems = [');
    if (start === -1) fail('could not find "const portfolioItems = [" in portfolio.js');
    let end = source.indexOf('\n];', start);
    if (end === -1) fail('could not find the end of portfolioItems in portfolio.js');
    if (source[end - 1] === '\r') end--;

    const eol = source.includes('\r\n') ? '\r\n' : '\n';
    const lines = source.slice(0, end).split(/\r?\n/);
    // The last non-comment line closes the previous entry and needs a trailing comma.
    for (let i = lines.length - 1; i >= 0; i--) {
        const t = lines[i].trim();
        if (!t || t.startsWith('//')) continue;
        if (t === '}') lines[i] = lines[i].replace('}', '},');
        break;
    }

    const entry = [
        '    {',
        `        href: ${jsString(item.href)},`,
        `        slug: ${jsString(item.slug)},`,
        `        title: ${jsString(item.title)},`,
        `        category: ${jsString(item.category)},`,
        `        description: ${jsString(item.description)}`,
        '    }',
    ].join(eol);

    return lines.join(eol) + eol + entry + source.slice(end);
}

async function launchBrowser() {
    const executablePath = process.env.CHROME_PATH;
    try {
        return await chromium.launch(executablePath ? { executablePath } : { channel: 'chrome' });
    } catch (e) {
        fail(`could not start Chrome (${e.message.split('\n')[0]}). Install Google Chrome or set CHROME_PATH.`);
    }
}

async function openPage(ctx, url) {
    const page = await ctx.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
        console.warn(`  load warning: ${e.message.split('\n')[0]}`);
    }
    // Let hero animations and lazy images settle.
    await page.waitForTimeout(3000);
    return page;
}

async function main() {
    const { url: rawUrl, opts } = parseArgs(process.argv.slice(2));
    if (!rawUrl) fail('usage: npm run add_to_portfolio https://example.com');

    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        fail(`invalid URL: ${rawUrl}`);
    }
    if (!/^https?:$/.test(url.protocol)) fail('URL must start with http:// or https://');

    const href = url.origin + (url.pathname === '/' ? '' : url.pathname);
    const slug = clean(opts.slug || slugFromUrl(url)).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!slug) fail('could not derive a slug from the URL; pass --slug');

    const source = fs.readFileSync(PORTFOLIO_JS, 'utf8');
    if (source.includes(`href: ${jsString(href)}`)) fail(`${href} is already in portfolioItems`);
    if (source.includes(`slug: ${jsString(slug)}`)) fail(`slug "${slug}" is already used; pass --slug`);

    const browser = await launchBrowser();
    let meta = {};
    try {
        for (const v of VARIANTS) {
            const ctx = await browser.newContext({
                viewport: v.viewport,
                deviceScaleFactor: v.deviceScaleFactor,
                isMobile: !!v.isMobile,
                hasTouch: !!v.hasTouch,
            });
            const page = await openPage(ctx, href);
            if (!v.suffix) {
                meta = await page.evaluate(() => {
                    const m = sel => document.querySelector(sel)?.getAttribute('content') || '';
                    return {
                        title: m('meta[property="og:title"]') || document.title,
                        description: m('meta[property="og:description"]') || m('meta[name="description"]'),
                    };
                });
            }
            const file = path.join(IMG_DIR, `${slug}${v.suffix}.jpg`);
            await page.screenshot({ path: file, type: 'jpeg', quality: v.quality });
            console.log(`saved ${path.relative(ROOT, file)}`);
            await ctx.close();
        }
    } finally {
        await browser.close();
    }

    const item = {
        href,
        slug,
        title: clean(opts.title || meta.title || url.hostname),
        category: clean(opts.category || 'Web Design'),
        description: clean(opts.description || meta.description),
    };
    fs.writeFileSync(PORTFOLIO_JS, appendItem(source, item));

    console.log(`added "${item.title}" to ${path.relative(ROOT, PORTFOLIO_JS)}`);
    if (!item.description) console.warn('No description found on the page; fill it in manually.');
    console.log('Review the title, category, and description before committing.');
}

main().catch(e => fail(e.message));
