/* Lab website — shared rendering. Each page sets <body data-page="..."> */
(function () {
  "use strict";

  const LAB = window.LAB || {};
  const OPENALEX = "https://api.openalex.org";
  const MAILTO = ""; // optional: your email, puts requests in OpenAlex's faster "polite pool"
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "—");
  const fmtDate = (d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const ext = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;

  const store = {
    get(k, ttl = 6 * 3600e3) { try { const v = JSON.parse(localStorage.getItem(k)); return v && Date.now() - v.t < ttl ? v.d : null; } catch { return null; } },
    set(k, d) { try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); } catch {} },
  };

  /* ---------- Chrome: header, footer, theme ---------- */
  const NAV = [
    ["index.html", "Index"],
    ["team.html", "Team"],
    ["publications.html", "Publications"],
    ["blog.html", "Blog"],
  ];

  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  function currentTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  try { applyTheme(localStorage.getItem("theme")); } catch {}

  function renderChrome() {
    const page = document.body.dataset.page;
    const here = location.pathname.split("/").pop() || "index.html";
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="wrap grid">
        <a class="brand" href="index.html"><span class="dot"></span>${esc(LAB.name)}</a>
        <nav class="nav" id="nav">
          ${NAV.map(([href, label], i) => {
            const active = href === here || (page === "post" && href === "blog.html");
            return `<a href="${href}"${active ? ' class="active" aria-current="page"' : ""}><span class="i">0${i}</span>${label}</a>`;
          }).join("")}
        </nav>
        <div class="header-tools">
          <button class="text-btn" id="theme-btn" aria-label="Toggle dark mode"></button>
          <button class="text-btn menu-btn" id="menu-btn" aria-expanded="false">Menu</button>
        </div>
      </div>`;
    document.body.prepend(header);

    const themeBtn = $("#theme-btn");
    const paint = () => (themeBtn.textContent = currentTheme() === "dark" ? "Light" : "Dark");
    paint();
    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch {}
      paint();
    });
    const menuBtn = $("#menu-btn");
    menuBtn.addEventListener("click", () => {
      const open = $("#nav").classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.textContent = open ? "Close" : "Menu";
    });

    const L = LAB.links || {};
    const connect = [
      LAB.email && `<li><a href="mailto:${esc(LAB.email)}">${esc(LAB.email)}</a></li>`,
      LAB.piEmail && `<li><a href="mailto:${esc(LAB.piEmail)}">${esc(LAB.piEmail)}</a></li>`,
      LAB.webOfScienceUrl && `<li>${ext(LAB.webOfScienceUrl, "Web of Science ↗")}</li>`,
      L.orcid && `<li>${ext(L.orcid, "ORCID ↗")}</li>`,
      L.scholar && `<li>${ext(L.scholar, "Google Scholar ↗")}</li>`,
      L.github && `<li>${ext(L.github, "GitHub ↗")}</li>`,
      L.bluesky && `<li>${ext(L.bluesky, "Bluesky ↗")}</li>`,
      L.linkedin && `<li>${ext(L.linkedin, "LinkedIn ↗")}</li>`,
    ].filter(Boolean).join("");
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="wrap grid">
        <div class="big">${esc(LAB.name)}<span class="dot">.</span></div>
        <div class="col"><span class="label">Address</span>${esc(LAB.affiliation)}<br>${esc(LAB.address)}</div>
        <div class="col"><span class="label">Pages</span><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>
        <div class="col"><span class="label">Connect</span><ul>${connect}</ul></div>
        <div class="col"><span class="label">Research</span><ul>${(LAB.research || []).map((r) => `<li>${esc(r.title)}</li>`).join("")}</ul></div>
        <div class="legal"><span>© ${new Date().getFullYear()} ${esc(LAB.name)}</span><span>${esc(LAB.tagline)}</span></div>
      </div>`;
    document.body.append(footer);
  }

  function initRise() {
    const els = document.querySelectorAll(".rise:not(.in)");
    if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Data: OpenAlex + Web of Science ---------- */
  function oaUrl(path, params = {}) {
    const u = new URL(OPENALEX + path);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    if (MAILTO) u.searchParams.set("mailto", MAILTO);
    return u.toString();
  }

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status + " " + url);
    return r.json();
  }

  async function getMetrics() {
    // Web of Science numbers (written by scripts/fetch_wos_metrics.py) take priority.
    const wos = window.WOS_METRICS;
    if (wos && typeof wos.citations === "number") {
      return { ...wos, source: "Web of Science", sourceUrl: LAB.webOfScienceUrl };
    }
    const cached = store.get("metrics");
    if (cached) return cached;
    try {
      const a = await fetchJSON(oaUrl(`/authors/https://orcid.org/${LAB.orcid}`));
      const m = {
        works: a.works_count,
        citations: a.cited_by_count,
        hIndex: a.summary_stats?.h_index,
        i10: a.summary_stats?.i10_index,
        source: "OpenAlex",
        sourceUrl: `https://openalex.org/${a.id.split("/").pop()}`,
        updated: new Date().toISOString().slice(0, 10),
        live: true,
      };
      store.set("metrics", m);
      return m;
    } catch (e) {
      console.warn("Metrics fallback:", e);
      return { ...window.METRICS_FALLBACK };
    }
  }

  const EXCLUDE_TYPES = new Set(["erratum", "paratext", "retraction", "peer-review", "other"]);

  async function getWorks() {
    const cached = store.get("works");
    if (cached) return cached;
    const select = "id,doi,title,publication_year,publication_date,type,cited_by_count,authorships,primary_location,open_access";
    let cursor = "*";
    const all = [];
    while (cursor && all.length < 1000) {
      const d = await fetchJSON(
        oaUrl("/works", { filter: `author.orcid:${LAB.orcid}`, sort: "publication_date:desc", "per-page": 200, cursor, select })
      );
      all.push(...d.results);
      cursor = d.meta.next_cursor;
      if (!d.results.length) break;
    }
    const works = all
      .filter((w) => w.title && !EXCLUDE_TYPES.has(w.type))
      .map((w) => ({
        title: w.title.replace(/<[^>]+>/g, ""),
        year: w.publication_year,
        date: w.publication_date,
        type: w.type,
        cites: w.cited_by_count,
        url: w.doi || w.primary_location?.landing_page_url || w.id,
        venue: w.primary_location?.source?.display_name || "",
        oa: !!w.open_access?.is_oa,
        authors: (w.authorships || []).map((a) => ({
          name: a.author?.display_name || "",
          me: (a.author?.orcid || "").endsWith(LAB.orcid),
        })),
      }));
    // Collapse duplicates (e.g. same title indexed twice); keep the most-cited record.
    const byTitle = new Map();
    for (const w of works) {
      const k = w.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const prev = byTitle.get(k);
      if (!prev || w.cites > prev.cites || (w.cites === prev.cites && w.type === "article")) byTitle.set(k, w);
    }
    const out = [...byTitle.values()].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    store.set("works", out);
    return out;
  }

  function perYear(works) {
    const counts = {};
    works.forEach((w) => w.year && (counts[w.year] = (counts[w.year] || 0) + 1));
    const years = Object.keys(counts).map(Number);
    if (!years.length) return [];
    const out = [];
    for (let y = Math.min(...years); y <= Math.max(...years); y++) out.push([y, counts[y] || 0]);
    return out;
  }


  /* ---------- Renderers ---------- */
  function renderMetrics(el, m) {
    const cols = [
      ["Citations", m.citations],
      ["h-index", m.hIndex],
      ["Publications", m.works],
      m.source === "Web of Science" ? ["Citing articles", m.citingArticles] : ["i10-index", m.i10],
    ].filter(([, v]) => typeof v === "number");
    el.innerHTML = cols
      .map(([l, v]) => `<div class="metric"><span class="label">${l}</span><span class="value" data-count="${v}">${fmt(v)}</span></div>`)
      .join("");
    countUp(el);
    const meta = $("#metrics-meta");
    if (meta) {
      meta.innerHTML = `
        <span>${m.live ? '<span class="live-dot"></span>Live' : "Snapshot"} · ${
          m.sourceUrl ? ext(m.sourceUrl, esc(m.source)) : esc(m.source)
        }${m.updated ? ` · ${esc(m.updated)}` : ""}</span>
        <span>${ext(LAB.webOfScienceUrl, "Web of Science profile ↗")}</span>`;
    }
  }

  function countUp(root) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (!target) return;
      const t0 = performance.now(), dur = 1200;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(target * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function renderYearChart(el, works) {
    const data = perYear(works);
    if (!data.length) return el.remove();
    const peak = Math.max(...data.map(([, n]) => n));
    const thisYear = new Date().getFullYear();
    el.innerHTML = `
      <div class="chart-head"><span class="label">Publications per year</span>
        <span>${data[0][0]}–${data[data.length - 1][0]}${data[data.length - 1][0] === thisYear ? ` · ${thisYear} year to date` : ""}</span></div>
      <div class="bars">${data.map(([y, n]) => `
        <div class="bar${n === peak ? " peak" : ""}${y === thisYear ? " partial" : ""}" title="${y}: ${n}">
          ${n ? `<span class="v">${n}</span>` : ""}<span class="f" style="height:${(n / peak) * 82}%"></span>
        </div>`).join("")}</div>
      <div class="years">${data.map(([y]) => `<span>${y}</span>`).join("")}</div>`;
  }

  function authorLine(authors) {
    let list = authors;
    if (authors.length > 8) {
      const meIdx = authors.findIndex((a) => a.me);
      const keep = new Set([0, 1, 2, authors.length - 1, meIdx]);
      list = [];
      authors.forEach((a, i) => {
        if (keep.has(i)) list.push(a);
        else if (list[list.length - 1] !== "…") list.push("…");
      });
    }
    return list.map((a) => (a === "…" ? "…" : a.me ? `<b>${esc(a.name)}</b>` : esc(a.name))).join(", ");
  }

  function pubItem(w, hot) {
    const kinds = [w.type !== "article" ? esc(w.type.replace("-", " ")) : "", w.oa ? '<span class="oa">Open access</span>' : ""].filter(Boolean);
    return `
      <li class="pub${hot ? " hot" : ""}">
        <span class="yr">${esc(w.year)}</span>
        <div class="main">
          <a class="title" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)}</a>
          <div class="authors">${authorLine(w.authors)}</div>
        </div>
        <div class="venue">${esc(w.venue)}${kinds.length ? `<span class="kind">${kinds.join(" · ")}</span>` : ""}</div>
        <div class="cites"><div class="n">${fmt(w.cites)}</div><div class="l">Citations</div></div>
      </li>`;
  }

  function personLinks(p) {
    const L = p.links || {};
    const links = [
      L.email && `<a href="mailto:${esc(L.email)}">Email</a>`,
      L.orcid && ext(L.orcid, "ORCID"),
      L.scholar && ext(L.scholar, "Scholar"),
      L.linkedin && ext(L.linkedin, "LinkedIn"),
      L.website && ext(L.website, "Website"),
    ].filter(Boolean).join("");
    return links ? `<div class="plinks">${links}</div>` : "";
  }

  function photo(p) {
    const initials = p.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("");
    return `<div class="photo">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="initials">${esc(initials)}</span>`}</div>`;
  }

  function postRow(p) {
    return `
      <li class="post-row rise">
        <a href="post.html?p=${encodeURIComponent(p.slug)}">
          <span class="date">${fmtDate(p.date)}${(p.tags || []).length ? `<span class="tags">${p.tags.map(esc).join(" · ")}</span>` : ""}</span>
          <span class="t">${esc(p.title)}</span>
          <span class="ex">${esc(p.excerpt)}</span>
          <span class="go">→</span>
        </a>
      </li>`;
  }

  /* ---------- Pages ---------- */
  async function pageHome() {
    $("#hero-title").innerHTML = esc(LAB.name).replace(/(\S+)$/, '<span class="red">$1</span>');
    $("#tagline").textContent = LAB.tagline;
    $("#intro").textContent = LAB.intro;
    $("#fig-affil").textContent = LAB.affiliation;
    $("#fig-caption").textContent = LAB.heroCaption || "Fig. 01";

    const img = $("#hero-img");
    img.addEventListener("error", () => { img.remove(); $("#hero-placeholder").hidden = false; });
    img.addEventListener("load", () => $("#hero-placeholder").remove());
    img.src = LAB.heroImage;

    $("#research").innerHTML = (LAB.research || [])
      .map((r, i) => `<article class="rise"><div class="n">0${i + 1}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${r.link ? `<a class="link" href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.linkLabel || "Read more")} <span class="arrow">↗</span></a>` : ""}</article>`)
      .join("");
    $("#latest-posts").innerHTML = (window.POSTS || []).slice(0, 3).map(postRow).join("");
    renderBluesky($("#bluesky"), 3);
    initRise();

    getMetrics().then((m) => renderMetrics($("#metrics"), m));
    try {
      const works = await getWorks();
      renderYearChart($("#year-chart"), works);
      const recent = works.filter((w) => w.type === "article" || w.type === "review").slice(0, 5);
      $("#recent-pubs").innerHTML = recent.map((w) => pubItem(w)).join("");
    } catch (e) {
      console.warn(e);
      $("#recent-pubs").innerHTML = `<li class="status">Publications could not be loaded right now. ${ext(LAB.webOfScienceUrl, "View on Web of Science ↗")}</li>`;
      $("#year-chart").remove();
    }
  }

  async function pagePublications() {
    getMetrics().then((m) => renderMetrics($("#metrics"), m));
    const list = $("#pub-list");
    let works;
    try {
      works = await getWorks();
    } catch (e) {
      list.innerHTML = `<p class="status">Publications could not be loaded right now. ${ext(LAB.webOfScienceUrl, "View on Web of Science ↗")}</p>`;
      return;
    }
    renderYearChart($("#year-chart"), works);
    const top = new Set([...works].sort((a, b) => b.cites - a.cites).slice(0, 10));

    const state = { q: "", type: "all", sort: "date" };
    const TYPES = [["all", "All"], ["article", "Articles"], ["review", "Reviews"], ["preprint", "Preprints"], ["other", "Other"]];
    const SORTS = [["date", "Newest"], ["cites", "Most cited"]];
    const main = new Set(["article", "review", "preprint"]);
    const btn = (attr, [k, l], on) => `<button data-${attr}="${k}"${on ? ' class="active"' : ""}>${l}</button>`;
    $("#filters").innerHTML =
      TYPES.map((t) => btn("type", t, t[0] === state.type)).join("") +
      `<span class="gap"></span>` +
      SORTS.map((s) => btn("sort", s, s[0] === state.sort)).join("");

    function draw() {
      const q = state.q.toLowerCase();
      let rows = works.filter((w) => {
        if (state.type === "other" ? main.has(w.type) : state.type !== "all" && w.type !== state.type) return false;
        if (!q) return true;
        return (w.title + " " + w.venue + " " + w.authors.map((a) => a.name).join(" ")).toLowerCase().includes(q);
      });
      $("#pub-count").textContent = `${rows.length} of ${works.length}`;
      if (!rows.length) return (list.innerHTML = `<p class="status">No publications match.</p>`);
      if (state.sort === "cites") {
        rows = [...rows].sort((a, b) => b.cites - a.cites);
        list.innerHTML = `<ol class="pubs">${rows.map((w) => pubItem(w, top.has(w))).join("")}</ol>`;
        return;
      }
      let html = "", year = null;
      rows.forEach((w) => {
        if (w.year !== year) {
          if (year !== null) html += "</ol>";
          year = w.year;
          html += `<div class="year-split">${year}</div><ol class="pubs">`;
        }
        html += pubItem(w, top.has(w));
      });
      list.innerHTML = html + "</ol>";
    }

    $("#pub-search").addEventListener("input", (e) => { state.q = e.target.value; draw(); });
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const key = b.dataset.type ? "type" : "sort";
      state[key] = b.dataset[key];
      document.querySelectorAll(`#filters [data-${key}]`).forEach((x) => x.classList.toggle("active", x === b));
      draw();
    });
    draw();
  }

  function pageTeam() {
    const GROUPS = [
      ["postdoc", "Postdoctoral researchers"],
      ["phd", "Doctoral students"],
      ["staff", "Staff"],
      ["student", "Students"],
      ["alumni", "Alumni"],
    ];
    const team = window.TEAM || [];
    const pis = team.filter((p) => p.group === "pi").map((p) => `
      <div class="pi-row grid rise">
        <span class="label">Principal investigator</span>
        ${photo(p)}
        <div class="info">
          <h2>${esc(p.name)}</h2>
          <span class="role">${esc(p.role)}</span>
          ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
          ${personLinks(p)}
        </div>
      </div>`).join("");
    const groups = GROUPS.map(([g, label]) => {
      const people = team.filter((p) => p.group === g);
      if (!people.length) return "";
      return `
        <div class="group grid">
          <span class="label">${label} <span class="muted">(${people.length})</span></span>
          <div class="people">${people.map((p) => `
            <article class="person rise">
              ${photo(p)}
              <h3>${esc(p.name)}</h3>
              <span class="role">${esc(p.role)}</span>
              ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
              ${personLinks(p)}
            </article>`).join("")}
          </div>
        </div>`;
    }).join("");
    $("#team").innerHTML = pis + groups;
    const join = $("#join-btn");
    if (join && LAB.email) join.href = `mailto:${LAB.email}?subject=${encodeURIComponent("Joining the " + LAB.name)}`;
    initRise();
  }

  function pageBlog() {
    const posts = window.POSTS || [];
    $("#posts").innerHTML = posts.length ? posts.map(postRow).join("") : `<li class="status">No posts yet.</li>`;
    initRise();
    renderBluesky($("#bluesky"), LAB.bluesky?.count || 6);
  }

  /* ---------- Bluesky stream ---------- */
  const BSKY = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";

  async function getBlueskyPosts(cfg) {
    const key = `bsky:${cfg.handle}:${cfg.includeReposts ? 1 : 0}${cfg.includeReplies ? 1 : 0}:${(cfg.hide || []).join(",")}`;
    const cached = store.get(key, 15 * 60e3);
    if (cached) return cached;
    const filter = cfg.includeReplies ? "posts_with_replies" : "posts_no_replies";
    const hidden = new Set((cfg.hide || []).map((h) => String(h).split("/").pop()));
    const d = await fetchJSON(`${BSKY}?actor=${encodeURIComponent(cfg.handle)}&limit=60&filter=${filter}`);
    const posts = d.feed
      .filter((it) => cfg.includeReposts || !it.reason) // reason = repost of someone else's post
      .filter((it) => !hidden.has(it.post.uri.split("/").pop()))
      .map((it) => {
        const p = it.post;
        return {
          rkey: p.uri.split("/").pop(),
          handle: p.author.handle,
          name: p.author.displayName || p.author.handle,
          avatar: p.author.avatar || "",
          reposted: !!it.reason,
          text: p.record.text || "",
          facets: p.record.facets || [],
          date: p.record.createdAt,
          likes: p.likeCount || 0,
          reposts: p.repostCount || 0,
          replies: p.replyCount || 0,
          embed: simplifyEmbed(p.embed),
        };
      });
    store.set(key, posts);
    return posts;
  }

  function simplifyEmbed(e) {
    if (!e) return null;
    const t = e.$type || "";
    if (t.startsWith("app.bsky.embed.images")) {
      const img = e.images?.[0];
      return img ? { kind: "image", src: img.thumb, alt: img.alt || "", more: e.images.length - 1 } : null;
    }
    if (t.startsWith("app.bsky.embed.external")) {
      const x = e.external;
      return { kind: "link", url: x.uri, title: x.title, desc: x.description, thumb: x.thumb || "" };
    }
    if (t.startsWith("app.bsky.embed.recordWithMedia")) return simplifyEmbed(e.media) || simplifyEmbed(e.record);
    if (t.startsWith("app.bsky.embed.record")) {
      const r = e.record?.record ? e.record : e.record;
      if (!r?.value?.text || !r.author) return null;
      return { kind: "quote", name: r.author.displayName || r.author.handle, text: r.value.text, url: `https://bsky.app/profile/${r.author.handle}/post/${r.uri.split("/").pop()}` };
    }
    return null;
  }

  // Turn Bluesky rich-text facets (byte ranges) into links, escaping everything else.
  function richText(text, facets) {
    const bytes = new TextEncoder().encode(text);
    const dec = new TextDecoder();
    const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);
    let out = "", pos = 0;
    for (const f of sorted) {
      const { byteStart, byteEnd } = f.index;
      if (byteStart < pos) continue;
      out += esc(dec.decode(bytes.slice(pos, byteStart)));
      const label = esc(dec.decode(bytes.slice(byteStart, byteEnd)));
      const feat = f.features?.[0] || {};
      const href = feat.uri || (feat.tag && `https://bsky.app/hashtag/${encodeURIComponent(feat.tag)}`) || (feat.did && `https://bsky.app/profile/${feat.did}`);
      out += href ? ext(href, label) : label;
      pos = byteEnd;
    }
    return (out + esc(dec.decode(bytes.slice(pos)))).replace(/\n/g, "<br>");
  }

  const plural = (n, one, many = one + "s") => `${fmt(n)} ${n === 1 ? one : many}`;

  function skeetCard(p) {
    const url = `https://bsky.app/profile/${p.handle}/post/${p.rkey}`;
    const when = new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const e = p.embed;
    let media = "";
    if (e?.kind === "image") media = `<a class="sk-img" href="${url}" target="_blank" rel="noopener"><img src="${esc(e.src)}" alt="${esc(e.alt)}" loading="lazy">${e.more > 0 ? `<span>+${e.more}</span>` : ""}</a>`;
    if (e?.kind === "link") media = `<a class="sk-link" href="${esc(e.url)}" target="_blank" rel="noopener">${e.thumb ? `<img src="${esc(e.thumb)}" alt="" loading="lazy">` : ""}<span class="t">${esc(e.title || e.url)}</span><span class="d">${esc(new URL(e.url).hostname.replace(/^www\./, ""))}</span></a>`;
    if (e?.kind === "quote") media = `<a class="sk-quote" href="${esc(e.url)}" target="_blank" rel="noopener"><span class="label">${esc(e.name)}</span>${esc(e.text.length > 220 ? e.text.slice(0, 220) + "…" : e.text)}</a>`;
    return `
      <article class="skeet rise">
        <header>
          <span class="label">${p.reposted ? `Reposted · ${esc(p.name)}` : "@" + esc(p.handle)}</span>
          <a class="date" href="${url}" target="_blank" rel="noopener">${when}</a>
        </header>
        ${p.text ? `<p class="sk-text">${richText(p.text, p.facets)}</p>` : ""}
        ${media}
        <a class="sk-stats" href="${url}" target="_blank" rel="noopener">
          <span>${plural(p.replies, "reply", "replies")}</span><span>${plural(p.reposts, "repost")}</span><span>${plural(p.likes, "like")}</span><span class="arrow">→</span>
        </a>
      </article>`;
  }

  async function renderBluesky(el, n) {
    const cfg = LAB.bluesky;
    if (!el || !cfg?.handle) return el?.closest("section")?.remove();
    const profile = `https://bsky.app/profile/${cfg.handle}`;
    document.querySelectorAll("[data-bsky-follow]").forEach((a) => (a.href = profile));
    try {
      const posts = (await getBlueskyPosts(cfg)).slice(0, n);
      el.innerHTML = posts.length
        ? posts.map(skeetCard).join("")
        : `<p class="status">No posts yet. ${ext(profile, "Follow on Bluesky ↗")}</p>`;
      initRise();
    } catch (e) {
      console.warn("Bluesky:", e);
      el.innerHTML = `<p class="status">Bluesky posts could not be loaded right now. ${ext(profile, "View on Bluesky ↗")}</p>`;
    }
  }

  function pagePost() {
    const slug = new URLSearchParams(location.search).get("p");
    const post = (window.POSTS || []).find((p) => p.slug === slug);
    const root = $("#article");
    if (!post) {
      root.innerHTML = `<h1>Post not found</h1><div class="meta grid"><a class="back" href="blog.html">← All posts</a></div>`;
      return;
    }
    document.title = `${post.title} — ${LAB.name}`;
    root.innerHTML = `
      <h1>${esc(post.title)}</h1>
      <div class="meta grid">
        <a class="back" href="blog.html">← All posts</a>
        <span class="info">${fmtDate(post.date)}${post.author ? ` · ${esc(post.author)}` : ""}${(post.tags || []).length ? ` · <span class="red">${post.tags.map(esc).join(", ")}</span>` : ""}</span>
      </div>
      ${post.cover ? `<img class="cover" src="${esc(post.cover)}" alt="">` : ""}
      <div class="grid"><div class="content" id="post-content"><p class="status">Loading…</p></div></div>
      ${post.paper || post.linkedin ? `<div class="grid"><div class="content post-links">${post.paper ? `<p><span class="label">Paper</span><br>${ext(post.paper.url, esc(post.paper.title) + " ↗")} <span class="muted">${esc(post.paper.journal)}</span></p>` : ""}${post.linkedin ? `<p><span class="label">Discussion</span><br>${ext(post.linkedin, "Originally posted on LinkedIn ↗")}</p>` : ""}</div></div>` : ""}`;
    // Post bodies are plain <script> files so the site also works when opened from disk.
    const s = document.createElement("script");
    s.src = `blog/posts/${encodeURIComponent(slug)}.js`;
    s.onload = () => ($("#post-content").innerHTML = window.POST_BODY || "");
    s.onerror = () => ($("#post-content").innerHTML = `<p class="status">This post's content is missing.</p>`);
    document.body.append(s);
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    const pages = { home: pageHome, publications: pagePublications, team: pageTeam, blog: pageBlog, post: pagePost };
    (pages[document.body.dataset.page] || (() => {}))();
  });
})();
