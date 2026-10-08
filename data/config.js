// Site-wide settings. Edit freely — every page reads from here.
window.LAB = {
  name: "Sankowski Lab",
  tagline: "Decoding the immune landscape of the brain",
  intro:
    "We combine single-cell and spatial multi-omics with computational biology to understand how microglia, macrophages and other immune cells shape brain health, neurodegeneration and brain tumors.",
  pi: "Roman Sankowski",
  affiliation: "University Medical Center Freiburg · University of Freiburg",
  email: "sankowski.lab@gmail.com", // general lab contact (footer, "Join us")
  piEmail: "roman.sankowski@uniklinik-freiburg.de",
  address: "Freiburg im Breisgau, Germany",

  // Hero image: drop your picture at this path (recommended ≥ 2400px wide).
  heroImage: "assets/img/hero.png",
  heroCaption: "Microglia, immunohistochemistry",

  // Researcher identifiers used for live metrics and publication lists.
  orcid: "0000-0001-9215-8021",
  webOfScienceId: "JWP-0390-2024",
  webOfScienceUrl: "https://www.webofscience.com/wos/author/record/JWP-0390-2024",

  links: {
    orcid: "https://orcid.org/0000-0001-9215-8021",
    scholar: "", // e.g. https://scholar.google.com/citations?user=...
    github: "",
    bluesky: "https://bsky.app/profile/rsankowski.bsky.social",
    linkedin: "https://www.linkedin.com/in/roman-sankowski",
  },

  // Live Bluesky stream on the Blog page and under "Journal" on the home page.
  bluesky: {
    handle: "rsankowski.bsky.social",
    count: 6, // posts shown on the Blog page (home shows 3)
    includeReposts: false, // true also shows posts you reposted from others
    includeReplies: false,
    // Hide individual posts: paste the post link (or just the ID at its end), e.g.
    // "https://bsky.app/profile/rsankowski.bsky.social/post/3mwihylqits2z"
    hide: [],
  },

  research: [
    {
      title: "Brain immune cell states",
      text: "Mapping microglia and border-associated macrophage heterogeneity across development, ageing and disease at single-cell resolution.",
      link: "https://www.nature.com/articles/s41593-025-01978-3",
      linkLabel: "Nature Neuroscience 2025",
    },
    {
      title: "Neuro-oncology",
      text: "Characterising the tumor immune microenvironment of gliomas and other brain tumors to identify prognostic and therapeutic targets.",
      link: "https://www.nature.com/articles/s41593-019-0532-y",
      linkLabel: "Nature Neuroscience 2019",
    },
    {
      title: "Spatial & multi-omics",
      text: "Developing and applying spatial transcriptomics, proteomics and computational tools that link cell states to tissue context.",
      link: "https://www.nature.com/articles/s41591-023-02673-1",
      linkLabel: "Nature Medicine 2023",
    },
    {
      title: "Real-time tumour diagnostics",
      text: "Fusing digital pathology (stimulated Raman histology et al.) with nanopore long-read methylation sequencing, so brain tumours can be diagnosed at molecular resolution while the patient is still in the operating room.",
      link: "https://papers.miccai.org/miccai-2026-sat/COMPAYL_056.html",
      linkLabel: "MICCAI 2026",
    },
  ],
};

// Shown if the live metrics service can't be reached (snapshot 2026-10-08, OpenAlex).
window.METRICS_FALLBACK = {
  works: 137,
  citations: 10198,
  hIndex: 33,
  i10: 53,
  source: "OpenAlex",
  updated: "2026-10-08",
};
