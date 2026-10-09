// Team members.
// Photos: save each photo in assets/img/team/ under the file name given in `photo`
// (square or portrait JPGs, ~800 px wide, work best). Until a file exists, initials are shown.
// group: "pi" | "postdoc" | "phd" | "staff" | "student" | "alumni"
// Alumni are listed by name only (no photo); `role` can hold e.g. "Now at …".
window.TEAM = [
  {
    name: "Roman Sankowski",
    role: "Principal Investigator",
    group: "pi",
    photo: "assets/img/team/roman-sankowski.jpg",
    bio: "Physician-scientist working at the interface of neuropathology, neuroimmunology and single-cell genomics.",
    links: { orcid: "https://orcid.org/0000-0001-9215-8021", email: "roman.sankowski@uniklinik-freiburg.de", linkedin: "https://www.linkedin.com/in/roman-sankowski" },
  },

  // Doctoral students
  { name: "Yun Liu", role: "PhD Student", group: "phd", photo: "assets/img/team/yun-liu.jpg", bio: "", links: {} },
  { name: "Jincheng Fang", role: "MD PhD Student", group: "phd", photo: "assets/img/team/jincheng-fang.jpg", bio: "", links: {} },
  { name: "Shifei Cai", role: "MD PhD Student", group: "phd", photo: "assets/img/team/shifei-cai.jpg", bio: "", links: {} },

  // Students
  { name: "Tuana Karaer", role: "MD Student · MOTI-VATE Fellow", group: "student", photo: "assets/img/team/tuana-karaer.jpg", bio: "", links: {} },

  // Alumni
  { name: "Ashkan Khavaran", role: "", group: "alumni" },
  { name: "Jonathan Cahueau", role: "", group: "alumni" },
  { name: "Niklas Binder", role: "", group: "alumni" },
  { name: "Alexander Benkendorff", role: "", group: "alumni" },
  { name: "Claire Mehlen", role: "", group: "alumni" },
];
