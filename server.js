import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ الصفحة الرئيسية للفحص
app.get("/", (req, res) => {
  res.send("✅ StaffSense Full HR API running...");
});

// ===============================
// ✅ البيانات المؤقتة في الذاكرة
// ===============================
let attendance = []; // حضور وانصراف
let permits = []; // تصاريح
let missions = []; // مأموريات

// ===============================
// 🕒 أدوات الوقت
// ===============================
function minutesDiff(a, b) {
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / 60000));
}
function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfFiscalYear(date = new Date()) {
  const d = new Date(date);
  const year = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, 6, 1, 0, 0, 0, 0);
}

// ===============================
// ✅ تسجيل الحضور
// ===============================
app.post("/attendance/checkin", (req, res) => {
  const { name, at, permitType } = req.body;
  if (!name) return res.status(400).json({ error: "الاسم مطلوب" });

  const now = at ? new Date(at) : new Date();
  const eight = new Date(now);
  eight.setHours(8, 0, 0, 0);
  const eight15 = new Date(now);
  eight15.setHours(8, 15, 0, 0);

  let record = {
    id: Date.now(),
    name,
    checkIn: now.toISOString(),
    status: "حضور",
    delayMinutes: 0,
  };

  if (now <= eight15) {
    record.delayMinutes = minutesDiff(now, eight);
    record.status = record.delayMinutes > 0 ? "تأخير" : "حضور";
    attendance.push(record);
    res.status(201).json(record);
  } else {
    // بعد 8:15 → تصريح
    if (!permitType || !["personal", "business"].includes(permitType))
      return res.status(400).json({ error: "بعد 8:15 يلزم تصريح شخصي أو مصلحي" });

    const mins = minutesDiff(now, eight);
    const permit = {
      id: Date.now(),
      name,
      date: now.toISOString(),
      type: permitType,
      minutes: mins,
    };
    permits.push(permit);
    record.status = "تصريح";
    attendance.push(record);
    res.status(201).json({ record, permit });
  }
});

// ✅ تسجيل الانصراف
app.post("/attendance/checkout", (req, res) => {
  const { name, at, permitType } = req.body;
  if (!name) return res.status(400).json({ error: "الاسم مطلوب" });

  const now = at ? new Date(at) : new Date();
  const threePM = new Date(now);
  threePM.setHours(15, 0, 0, 0);
  const fivePM = new Date(now);
  fivePM.setHours(17, 0, 0, 0);

  let record = attendance.find(
    (r) => r.name === name && !r.checkOut
  );

  if (!record)
    record = { id: Date.now(), name, checkIn: null, status: "غير محدد" };

  record.checkOut = now.toISOString();

  if (now < threePM) {
    if (!permitType || !["personal", "business"].includes(permitType))
      return res.status(400).json({ error: "الانصراف قبل 15:00 يتطلب تصريح" });
    const mins = minutesDiff(threePM, now);
    const permit = {
      id: Date.now(),
      name,
      date: now.toISOString(),
      type: permitType,
      minutes: mins,
      direction: "خروج",
    };
    permits.push(permit);
    record.status = "انصراف بتصريح";
  } else if (now >= fivePM) {
    record.status = "عمل إضافي";
    record.overtimeMinutes = minutesDiff(now, threePM);
  } else {
    record.status = "انصراف طبيعي";
  }

  attendance.push(record);
  res.status(201).json(record);
});

// ✅ المأموريات
app.post("/missions", (req, res) => {
  const { name, from, to } = req.body;
  if (!name || !from || !to) return res.status(400).json({ error: "بيانات ناقصة" });
  const fromD = new Date(from);
  const toD = new Date(to);
  const mins = minutesDiff(toD, fromD);
  const m = { id: Date.now(), name, from, to, minutes: mins };
  missions.push(m);
  res.status(201).json(m);
});

// ✅ الإحصائيات والخصومات
app.get("/summary", (req, res) => {
  const { name } = req.query;
  const now = new Date();
  const mStart = startOfMonth(now).getTime();
  const fyStart = startOfFiscalYear(now).getTime();

  const monthDelay = attendance
    .filter((r) => new Date(r.checkIn || 0).getTime() >= mStart)
    .filter((r) => (name ? r.name === name : true))
    .reduce((s, r) => s + (r.status === "تأخير" ? r.delayMinutes || 0 : 0), 0);

  const personalPermits = permits
    .filter((p) => new Date(p.date).getTime() >= fyStart)
    .filter((p) => (name ? p.name === name : true))
    .reduce((s, p) => s + (p.type === "personal" ? p.minutes : 0), 0);

  const overtimeDays = attendance
    .filter((r) => (name ? r.name === name : true))
    .filter((r) => r.status === "عمل إضافي").length;

  const monthlyDeduction = monthDelay >= 95 ? 1 : 0;
  const yearlyDeduction = Math.floor(personalPermits / 420);

  res.json({
    name: name || "الكل",
    monthDelay,
    personalPermits,
    overtimeDays,
    monthlyDeduction,
    yearlyDeduction,
  });
});

app.listen(port, () =>
  console.log(`✅ StaffSense HR API running on port ${port}`)
);
