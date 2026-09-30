// Başlangıç içeriğini MongoDB'ye yazar: npm run seed (-- --force ile mevcut veriyi ezer)
import { MongoClient } from "mongodb";
import { DEFAULT_PROFILE } from "../netlify/default-profile.mjs";

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const col = client.db(process.env.MONGODB_DB || "portfolio").collection("site");
  const exists = await col.findOne({ _id: "profile" });
  if (exists && !process.argv.includes("--force")) {
    console.log("Veritabanında zaten içerik var. Üzerine yazmak için: npm run seed -- --force");
  } else {
    await col.replaceOne({ _id: "profile" }, { ...DEFAULT_PROFILE, updatedAt: new Date() }, { upsert: true });
    console.log("İçerik veritabanına yazıldı ✓");
  }
} finally {
  await client.close();
}
