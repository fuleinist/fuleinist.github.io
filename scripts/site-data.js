'use strict';

/**
 * Builds data/site.json — everything the site renders at runtime.
 * Public GitHub data + contribution calendar (needs a token for GraphQL).
 * Run: GITHUB_TOKEN=... node scripts/site-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOGIN = 'fuleinist';
const EXCLUDE = new Set([LOGIN, `${LOGIN}.github.io`]);
const MAX_PROJECTS = 12;

const EXPERIMENTS = [
  { title: 'star wars intro', path: 'star-wars-intro.html', desc: 'CSS 3D opening crawl — the previous landing page', tag: 'CSS 3D' },
  { title: 'earth & moon', path: 'aframe-earth-moon/', desc: 'Textured earth, moon and starfield in WebVR', tag: 'A-Frame' },
  { title: '360 video', path: 'aframe-360-video/', desc: 'Immersive 360-degree video playback in the browser', tag: 'A-Frame' },
  { title: 'ar model', path: 'aframe-ar/', desc: 'glTF model placed over the live camera feed', tag: 'WebAR' },
  { title: 'photogrammetry tower', path: 'aframe-tp-tower/', desc: 'A scanned tower rebuilt as a VR scene', tag: '3D scan' },
  { title: 'vr survey', path: 'aframe-vr-survey/', desc: 'Immersive survey with spatial audio', tag: 'WebVR' },
  { title: 'legacy portfolio', path: 'me/', desc: 'The original Freelancer-theme site', tag: 'archive' }
];

const token = process.env.GH_TOKEN || '';
const H = { Accept: 'application/vnd.github+json', 'User-Agent': `${LOGIN}-site-telemetry` };
if (token) H.Authorization = 'Bearer ' + token;

async function api(p) {
  const r = await fetch(`https://api.github.com${p}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${p} -> ${r.status}`);
  return r.json();
}

async function graphql(query, variables) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const j = await r.json();
  if (j.errors) throw new Error(`graphql: ${JSON.stringify(j.errors)}`);
  return j.data;
}

(async () => {
  const user = await api(`/users/${LOGIN}`);

  let repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await api(`/users/${LOGIN}/repos?per_page=100&page=${page}&sort=pushed`);
    repos = repos.concat(batch);
    if (batch.length < 100) break;
  }

  const own = repos.filter((r) => !r.fork);
  const visible = own.filter((r) => !EXCLUDE.has(r.name));

  const langCount = {};
  for (const r of own) if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;

  const languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));

  const ranked = [...visible].sort(
    (a, b) =>
      b.stargazers_count - a.stargazers_count ||
      new Date(b.pushed_at) - new Date(a.pushed_at) ||
      a.name.localeCompare(b.name)
  );

  const projects = ranked.slice(0, MAX_PROJECTS).map((r) => ({
    name: r.name,
    description: r.description || '',
    language: r.language || '',
    stars: r.stargazers_count,
    forks: r.forks_count,
    pushedAt: r.pushed_at,
    url: r.html_url,
    homepage: r.homepage || '',
    topics: r.topics || []
  }));

  let contributions = null;
  if (token) {
    const to = new Date();
    const from = new Date(to.getTime() - 365 * 864e5);
    const data = await graphql(
      `query($login:String!,$from:DateTime!,$to:DateTime!){
        user(login:$login){
          contributionsCollection(from:$from,to:$to){
            contributionCalendar{
              totalContributions
              weeks{ contributionDays{ date contributionCount weekday } }
            }
          }
        }
      }`,
      { login: LOGIN, from: from.toISOString(), to: to.toISOString() }
    );
    const cal = data.user.contributionsCollection.contributionCalendar;
    contributions = {
      total: cal.totalContributions,
      weeks: cal.weeks.map((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday }))
      )
    };
  }

  const out = {
    login: LOGIN,
    generatedAt: new Date().toISOString(),
    profile: {
      name: user.name || LOGIN,
      bio: user.bio || '',
      location: user.location || '',
      blog: user.blog || '',
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at
    },
    stats: {
      ownRepos: own.length,
      totalStars: own.reduce((s, r) => s + r.stargazers_count, 0),
      totalForks: own.reduce((s, r) => s + r.forks_count, 0),
      contributions: contributions ? contributions.total : null
    },
    languages,
    projects,
    contributions,
    experiments: EXPERIMENTS
  };

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data', 'site.json'), JSON.stringify(out, null, 2) + '\n');

  console.log('wrote data/site.json', {
    repos: own.length,
    stars: out.stats.totalStars,
    projects: projects.length,
    languages: languages.length,
    contributions: out.stats.contributions
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});