import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ الصفحة الرئيسية للتأكد إن السيرفر شغال
app.get("/", (req, res) => {
  res.send("✅ StaffSense Full API is running...");
});

// 🧍 قسم الموظفين
let employees = [];
app.get("/employees", (req, res) => res.json(employees));
app.post("/employees", (req, res) => {
  const emp = { id: Date.now(), ...req.body };
  employees.push(emp);
  res.status(201).json(emp);
});

// 🕒 قسم الحضور والانصراف
let attendance = [];
app.get("/attendance", (req, res) => res.json(attendance));
app.post("/attendance", (req, res) => {
  const record = { id: Date.now(), ...req.body };
  attendance.push(record);
  res.status(201).json(record);
});

// 🌴 قسم الإجازات
let leaves = [];
app.get("/leaves", (req, res) => res.json(leaves));
app.post("/leaves", (req, res) => {
  const leave = { id: Date.now(), ...req.body };
  leaves.push(leave);
  res.status(201).json(leave);
});

// 📄 قسم الطلبات
let requests = [];
app.get("/requests", (req, res) => res.json(requests));
app.post("/requests", (req, res) => {
  const request = { id: Date.now(), ...req.body };
  requests.push(request);
  res.status(201).json(request);
});

// 📊 قسم التقارير
app.get("/reports", (req, res) => {
  res.json({
    employees: employees.length,
    attendance: attendance.length,
    leaves: leaves.length,
    requests: requests.length,
  });
});

// ⚙️ قسم الإعدادات
let settings = { workHours: "9:00 - 17:00", overtimeRate: 1.5 };
app.get("/settings", (req, res) => res.json(settings));
app.put("/settings", (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

// 🧑‍💼 قسم الأدمن
const admin = { username: "admin", password: "123456" };
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password)
    res.json({ message: "Login successful", token: "staffsense-token" });
  else res.status(401).json({ error: "Invalid credentials" });
});

// 🚀 تشغيل السيرفر
app.listen(port, () => {
  console.log(`✅ Full API running on port ${port}`);
});
