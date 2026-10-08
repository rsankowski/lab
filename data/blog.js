// Blog posts, newest first. Each post body lives in blog/posts/<slug>.js
// (sets window.POST_BODY) and is shown on blog/post.html?p=<slug>.
window.POSTS = [
  {
    slug: "welcome",
    title: "Welcome to the new lab website",
    date: "2026-10-08",
    author: "Roman Sankowski",
    tags: ["News"],
    excerpt:
      "We have a new home on the web. Here you'll find our latest publications, the people behind the science and updates from the lab.",
    cover: "",
  },
  {
    slug: "senescent-cells-brain-barriers",
    title: "Like a good wine: senescence helps build the brain's barriers",
    date: "2026-06-16",
    author: "Roman Sankowski",
    tags: ["Paper highlight", "Development"],
    excerpt:
      "Senescence is usually linked to ageing. A new Cell paper shows it is also a programmed tool that shapes the blood-brain and blood-CSF barriers in the embryo.",
    cover: "",
    paper: {
      title: "Persistent and transient senescent cells contribute to brain-barrier development",
      journal: "Cell, 2026",
      url: "https://doi.org/10.1016/j.cell.2026.05.022",
    },
    linkedin: "https://www.linkedin.com/posts/roman-sankowski_persistent-and-transient-senescent-cells-activity-7472765485667975168-Gkmj",
  },
  {
    slug: "macrophages-nibble-living-cells",
    title: "Hungry macrophages: taking small bites out of living cells",
    date: "2026-04-29",
    author: "Roman Sankowski",
    tags: ["Paper highlight", "Immunology"],
    excerpt:
      "Macrophages don't only eat dead cells. A Nature paper shows they sample tiny pieces of healthy, living neighbours and show them to CD8 T cells.",
    cover: "",
    paper: {
      title: "Submicrometre sampling of living cells by macrophages",
      journal: "Nature, 2026",
      url: "https://doi.org/10.1038/s41586-026-10435-5",
    },
    linkedin: "https://www.linkedin.com/posts/roman-sankowski_immunology-sciencecommunication-macrophages-activity-7455362628148686849-qymf",
  },
];
