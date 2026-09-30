// Sitenin başlangıç içeriği: veritabanı boşken gösterilir, `npm run seed` ile veritabanına yazılır
export const DEFAULT_PROFILE = {
  name: "SHAHIN BAIRAMOVI",
  title: "Bilgisayar Mühendisliği Öğrencisi",
  about:
    "Necmettin Erbakan Üniversitesi Bilgisayar Mühendisliği bölümünde eğitimime devam ediyorum. Eğitimim boyunca veri yapıları, algoritmalar, ağ yönetimi, bilgisayar mimarisi, optimizasyon algoritmaları ve nesne yönelimli programlama gibi alanlarda kendimi geliştirdim.\n\nŞu anda Memak Makine bünyesinde staj sürecime devam ediyorum. Hedefim, kendimi backend ve DevOps alanlarında geliştirerek ölçeklenebilir ve güvenilir sistemler kurmak.",
  email: "shahinbyrmvv@gmail.com",
  github: "https://github.com/Shahinbyrmv",
  linkedin: "https://www.linkedin.com/in/shahinbyrmv",
  roadmapUrl: "https://backendroadmapsb.netlify.app",
  skills: [
    { category: "Programlama Dilleri", items: ["Python", "PHP", "C", "C++", "JavaScript", "HTML", "CSS", "Swift"] },
    { category: "Backend & DevOps", items: ["SQL", "Docker", "Veritabanı Yönetimi", "Sunucu Yapılandırmaları"] },
    {
      category: "Kavramlar & Yapılar",
      items: ["Yapay Sinir Ağları (YSA)", "Yapay Zeka (AI)", "Algoritma Optimizasyonları", "Veri Yapıları"],
    },
  ],
  experience: [
    { company: "Memak Makine", role: "Stajyer", start: "14 Eylül 2026", end: "Devam ediyor", description: "" },
  ],
  education: [
    { school: "Necmettin Erbakan Üniversitesi", department: "Bilgisayar Mühendisliği", start: "2021", end: "Devam ediyor" },
  ],
};
