// Yalnızca API'ye ulaşılamazsa gösterilir; asıl içerik veritabanından gelir
const FALLBACK = {
  name: "SHAHIN BAIRAMOVI",
  title: "Bilgisayar Mühendisliği Öğrencisi",
  about: "Necmettin Erbakan Üniversitesi Bilgisayar Mühendisliği bölümünde eğitimime devam ediyorum. Eğitimim boyunca veri yapıları, algoritmalar, ağ yönetimi, bilgisayar mimarisi, optimizasyon algoritmaları ve nesne yönelimli programlama gibi alanlarda kendimi geliştirdim.\n\nŞu anda Memak Makine bünyesinde staj sürecime devam ediyorum. Hedefim, kendimi backend ve DevOps alanlarında geliştirerek ölçeklenebilir ve güvenilir sistemler kurmak.",
  email: "shahinbyrmvv@gmail.com",
  github: "https://github.com/Shahinbyrmv",
  linkedin: "https://www.linkedin.com/in/shahinbyrmv",
  roadmapUrl: "https://backendroadmapsb.netlify.app",
  skills: [
    { category: "Programlama Dilleri", items: ["Python", "PHP", "C", "C++", "JavaScript", "HTML", "CSS", "Swift"] },
    { category: "Backend & DevOps", items: ["SQL", "Docker", "Veritabanı Yönetimi", "Sunucu Yapılandırmaları"] },
    { category: "Kavramlar & Yapılar", items: ["Yapay Sinir Ağları (YSA)", "Yapay Zeka (AI)", "Algoritma Optimizasyonları", "Veri Yapıları"] },
  ],
  experience: [{ company: "Memak Makine", role: "Stajyer", start: "14 Eylül 2026", end: "Devam ediyor", description: "" }],
  education: [{ school: "Necmettin Erbakan Üniversitesi", department: "Bilgisayar Mühendisliği", start: "2021", end: "Devam ediyor" }],
};

// Düzenleme panelindeki alanların tanımı
const FIELDS = [
  { key: "name", label: "Ad Soyad" },
  { key: "title", label: "Unvan / Kısa tanım" },
  { key: "about", label: "Hakkımda", multiline: true },
  { key: "email", label: "E-posta" },
  { key: "github", label: "GitHub linki" },
  { key: "linkedin", label: "LinkedIn linki" },
  { key: "roadmapUrl", label: "Backend Roadmap linki" },
];

const LISTS = [
  {
    key: "skills", title: "Yetenekler", addLabel: "+ Kategori ekle",
    empty: { category: "", items: [] },
    fields: [
      { key: "category", label: "Kategori" },
      { key: "items", label: "Yetenekler (virgülle ayır)", csv: true },
    ],
  },
  {
    key: "experience", title: "Deneyim", addLabel: "+ Deneyim ekle",
    empty: { company: "", role: "", start: "", end: "", description: "" },
    fields: [
      { key: "company", label: "Şirket" },
      { key: "role", label: "Pozisyon" },
      { key: "start", label: "Başlangıç" },
      { key: "end", label: "Bitiş" },
      { key: "description", label: "Açıklama", multiline: true },
    ],
  },
  {
    key: "education", title: "Eğitim", addLabel: "+ Eğitim ekle",
    empty: { school: "", department: "", start: "", end: "" },
    fields: [
      { key: "school", label: "Okul" },
      { key: "department", label: "Bölüm" },
      { key: "start", label: "Başlangıç" },
      { key: "end", label: "Bitiş" },
    ],
  },
];

const $ = (id) => document.getElementById(id);
let profile = FALLBACK;
let draft = null;

const storage = {
  get() { try { return sessionStorage.getItem("token"); } catch { return null; } },
  set(v) { try { sessionStorage.setItem("token", v); } catch {} },
  clear() { try { sessionStorage.removeItem("token"); } catch {} },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function setLink(id, href, text) {
  const a = $(id);
  if (!a) return;
  const ok = /^(https?:\/\/|mailto:)/i.test(href || "");
  a.hidden = !ok;
  if (ok) a.href = href;
  if (text != null) a.textContent = text;
}

// ---------- Sayfayı çiz ----------
function render(p) {
  $("name").textContent = p.name || "SHAHIN BAIRAMOVI";
  $("title").textContent = p.title || "";
  $("about").textContent = p.about || "";

  setLink("roadmapLink", p.roadmapUrl);
  setLink("githubLink", p.github);
  setLink("linkedinLink", p.linkedin);
  setLink("githubLink2", p.github);
  setLink("linkedinLink2", p.linkedin);
  setLink("emailLink", p.email ? `mailto:${p.email}` : "", p.email);

  const skills = $("skills");
  skills.replaceChildren(...(p.skills || []).map((s) => {
    const card = el("div", "skill-card");
    card.append(el("h3", null, s.category));
    const tags = el("div", "tags");
    tags.append(...(s.items || []).map((i) => el("span", "tag", i)));
    card.append(tags);
    return card;
  }));

  const timelineItem = (heading, sub, start, end, desc) => {
    const item = el("div", "t-item");
    const head = el("div", "t-head");
    const left = el("div");
    left.append(el("h3", null, heading));
    if (sub) left.append(el("p", "t-sub", sub));
    head.append(left, el("span", "t-date", [start, end].filter(Boolean).join(" – ")));
    item.append(head);
    if (desc) item.append(el("p", "t-desc", desc));
    return item;
  };

  $("experience").replaceChildren(...(p.experience || []).map((e) =>
    timelineItem(e.company, e.role, e.start, e.end, e.description)));
  $("education").replaceChildren(...(p.education || []).map((e) =>
    timelineItem(e.school, e.department, e.start, e.end)));
}

async function load() {
  try {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error(res.status);
    profile = await res.json();
  } catch {
    profile = FALLBACK;
  }
  render(profile);
}

// ---------- Giriş ----------
function updateLoginButton() {
  $("loginBtn").textContent = storage.get() ? "Düzenle" : "Giriş";
}

$("loginBtn").addEventListener("click", () => {
  if (storage.get()) return openEditor();
  $("loginError").textContent = "";
  $("passwordInput").value = "";
  $("loginDialog").showModal();
});

$("loginCancel").addEventListener("click", () => $("loginDialog").close());

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loginError").textContent = "";
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: $("passwordInput").value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Giriş başarısız");
    storage.set(data.token);
    $("loginDialog").close();
    updateLoginButton();
    openEditor();
  } catch (err) {
    $("loginError").textContent = err.message;
  }
});

// ---------- Düzenleme paneli ----------
function input(field, value, onChange) {
  const label = el("label", null, field.label);
  const control = el(field.multiline ? "textarea" : "input");
  if (field.multiline) control.rows = field.key === "about" ? 10 : 4;
  control.value = field.csv ? (value || []).join(", ") : value || "";
  control.addEventListener("input", () => {
    onChange(field.csv ? control.value.split(",").map((s) => s.trim()).filter(Boolean) : control.value);
  });
  label.append(control);
  return label;
}

function renderEditor() {
  const form = $("editorForm");
  const general = el("div", "ed-group");
  general.append(el("h4", null, "Genel"));
  FIELDS.forEach((f) => general.append(input(f, draft[f.key], (v) => { draft[f.key] = v; })));

  const groups = LISTS.map((list) => {
    const group = el("div", "ed-group");
    group.append(el("h4", null, list.title));
    (draft[list.key] ||= []).forEach((item, index) => {
      const box = el("div", "ed-item");
      list.fields.forEach((f) => box.append(input(f, item[f.key], (v) => { item[f.key] = v; })));
      const actions = el("div", "row-end");
      const move = (dir) => {
        const arr = draft[list.key];
        const to = index + dir;
        if (to < 0 || to >= arr.length) return;
        [arr[index], arr[to]] = [arr[to], arr[index]];
        renderEditor();
      };
      const up = el("button", "btn btn-sm", "↑");
      up.type = "button";
      up.onclick = () => move(-1);
      const down = el("button", "btn btn-sm", "↓");
      down.type = "button";
      down.onclick = () => move(1);
      const del = el("button", "btn btn-sm btn-danger", "Sil");
      del.type = "button";
      del.onclick = () => { draft[list.key].splice(index, 1); renderEditor(); };
      actions.append(up, down, del);
      box.append(actions);
      group.append(box);
    });
    const add = el("button", "btn btn-sm", list.addLabel);
    add.type = "button";
    add.onclick = () => { draft[list.key].push(structuredClone(list.empty)); renderEditor(); };
    group.append(add);
    return group;
  });

  form.replaceChildren(general, ...groups);
}

function openEditor() {
  draft = structuredClone(profile);
  $("saveStatus").textContent = "";
  renderEditor();
  $("editor").hidden = false;
}

$("editorForm").addEventListener("submit", (e) => e.preventDefault());
$("editorClose").addEventListener("click", () => { $("editor").hidden = true; });

$("logoutBtn").addEventListener("click", () => {
  storage.clear();
  $("editor").hidden = true;
  updateLoginButton();
});

$("saveBtn").addEventListener("click", async () => {
  const status = $("saveStatus");
  status.textContent = "Kaydediliyor…";
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${storage.get()}` },
      body: JSON.stringify(draft),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      storage.clear();
      updateLoginButton();
      throw new Error("Oturum süresi doldu, tekrar giriş yap");
    }
    if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
    profile = data;
    render(profile);
    status.textContent = "Kaydedildi ✓";
  } catch (err) {
    status.textContent = err.message;
  }
});

$("year").textContent = new Date().getFullYear();
updateLoginButton();
load();
