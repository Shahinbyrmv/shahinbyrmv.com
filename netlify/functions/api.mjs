import { MongoClient } from "mongodb";
import crypto from "node:crypto";
import { DEFAULT_PROFILE } from "../default-profile.mjs";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

let clientPromise = null;

async function getCollection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI tanımlı değil");
  if (!clientPromise) {
    clientPromise = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "portfolio").collection("site");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function hmac(value) {
  return crypto.createHmac("sha256", process.env.TOKEN_SECRET).update(value).digest("base64url");
}

function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function isAuthorized(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, hmac(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

// Gelen veriyi yalnızca izin verilen alanlarla ve uzunluk sınırlarıyla kabul et
const str = (v, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const url = (v) => {
  const s = str(v, 500);
  return /^(https?:\/\/|mailto:)/i.test(s) ? s : "";
};
const list = (v, mapItem, max = 30) => (Array.isArray(v) ? v.slice(0, max).map(mapItem) : []);

function sanitize(input) {
  const p = input && typeof input === "object" ? input : {};
  return {
    name: str(p.name, 100),
    title: str(p.title, 200),
    about: str(p.about, 3000),
    email: str(p.email, 200),
    github: url(p.github),
    linkedin: url(p.linkedin),
    roadmapUrl: url(p.roadmapUrl),
    skills: list(p.skills, (s) => ({
      category: str(s?.category, 100),
      items: list(s?.items, (i) => str(i, 100), 50).filter(Boolean),
    })),
    experience: list(p.experience, (e) => ({
      company: str(e?.company, 150),
      role: str(e?.role, 150),
      start: str(e?.start, 50),
      end: str(e?.end, 50),
      description: str(e?.description, 2000),
    })),
    education: list(p.education, (e) => ({
      school: str(e?.school, 150),
      department: str(e?.department, 150),
      start: str(e?.start, 50),
      end: str(e?.end, 50),
    })),
  };
}

export default async (req) => {
  const route = new URL(req.url).pathname.replace(/^\/api/, "").replace(/\/$/, "");

  try {
    if (route === "/profile" && req.method === "GET") {
      const col = await getCollection();
      const doc = await col.findOne({ _id: "profile" });
      if (!doc) return json(DEFAULT_PROFILE);
      const { _id, updatedAt, ...profile } = doc;
      return json(profile);
    }

    if (route === "/login" && req.method === "POST") {
      if (!process.env.ADMIN_PASSWORD || !process.env.TOKEN_SECRET) {
        return json({ error: "Sunucu yapılandırması eksik" }, 500);
      }
      const body = await req.json().catch(() => ({}));
      // Kaba kuvvet denemelerini yavaşlat
      await new Promise((r) => setTimeout(r, 400));
      if (!safeEqual(body.password || "", process.env.ADMIN_PASSWORD)) {
        return json({ error: "Şifre hatalı" }, 401);
      }
      return json({ token: createToken() });
    }

    if (route === "/profile" && req.method === "PUT") {
      if (!process.env.TOKEN_SECRET || !isAuthorized(req)) return json({ error: "Yetkisiz" }, 401);
      const body = await req.json().catch(() => null);
      if (!body) return json({ error: "Geçersiz veri" }, 400);
      const profile = sanitize(body);
      const col = await getCollection();
      await col.replaceOne({ _id: "profile" }, { ...profile, updatedAt: new Date() }, { upsert: true });
      return json(profile);
    }

    return json({ error: "Bulunamadı" }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: "Sunucu hatası" }, 500);
  }
};

export const config = { path: "/api/*" };
