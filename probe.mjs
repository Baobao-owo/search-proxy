// 探测 runner 能访问哪些搜索站点
import fs from 'node:fs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function probe(name, url, opts = {}) {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', ...(opts.headers || {}) },
      signal: AbortSignal.timeout(25000)
    });
    const text = await res.text();
    const blocked = /captcha|challenge|bots use|verify you are human|unusual traffic/i.test(text.slice(0, 4000));
    return { name, status: res.status, len: text.length, blocked, head: text.slice(0, 160) };
  } catch (e) {
    return { name, error: String((e.cause && e.cause.code) || e.message).slice(0, 120) };
  }
}

const results = [];
results.push(await probe('ddg-html', 'https://html.duckduckgo.com/html/?q=chunithm'));
results.push(
  await probe('ddg-html-post', 'https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'q=chunithm'
  })
);
results.push(await probe('ddg-lite', 'https://lite.duckduckgo.com/lite/?q=chunithm'));
results.push(await probe('ddg-api', 'https://api.duckduckgo.com/?q=chunithm&format=json&no_html=1'));
results.push(await probe('google', 'https://www.google.com/search?q=chunithm'));
results.push(await probe('bing', 'https://www.bing.com/search?q=chunithm'));
results.push(await probe('searx-be', 'https://searx.be/search?q=chunithm&format=json'));
results.push(await probe('brave', 'https://search.brave.com/search?q=chunithm'));
results.push(await probe('mojeek', 'https://www.mojeek.com/search?q=chunithm'));
results.push(await probe('startpage', 'https://www.startpage.com/sp/search?query=chunithm'));
results.push(await probe('wikiwiki', 'https://wikiwiki.jp/chunithmwiki/'));

fs.writeFileSync('out/probe.json', JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results, null, 1));
