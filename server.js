import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 10000;

// ميدلوير
app.use(cors());
app.use(express.json());

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("✅ StaffSense Full HR API running...");
});

// ===== قسم الموظفين =====
let employees = [];

app.get("/employees", (req, res) => {
  res.json(employees);
});

app.post("/employees", (req, res) => {
  try {
    const emp = { id: Date.now(), ...req.body };

    if (!emp.name || !emp.email || !emp.phone) {
      return res.status(400).json({ error: "البيانات غير مكتملة" });
    }

    employees.push(emp);
    console.log("✅ تم إضافة موظف:", emp.name);
    res.status(201).json({ message: "تمت الإضافة بنجاح", employee: emp });
  } catch (err) {
    console.error("❌ خطأ أثناء الإضافة:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
});

// ===== قسم الحضور والانصراف =====
let attendance = [];

app.get("/attendance", (req, res) => {
  res.json(attendance);
});

app.post("/attendance", (req, res) => {
  const record = { id: Date.now(), ...req.body };
  attendance.push(record);
  res.status(201).json(record);
});

// ===== تشغيل السيرفر =====
app.listen(port, () => {
  console.log(`✅ API running on port ${port}`);
});
