import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 10000;

// ✅ تشغيل الـ middlewares
app.use(cors());
app.use(express.json());

// ✅ الصفحة الرئيسية (تأكد أن السيرفر شغال)
app.get("/", (req, res) => {
  res.send("✅ StaffSense Full HR API running...");
});

// ==================== قسم الموظفين ====================

let employees = [];

// 🟢 جلب كل الموظفين
app.get("/employees", (req, res) => {
  res.json(employees);
});

// 🟢 إضافة موظف جديد
app.post("/employees", (req, res) => {
  try {
    const emp = { id: Date.now(), ...req.body };

    // تحقق من أن البيانات الأساسية موجودة
    if (!emp.name || !emp.email || !emp.phone) {
      return res.status(400).json({ error: "البيانات غير مكتملة" });
    }

    employees.push(emp);
    console.log("✅ تم إضافة موظف:", emp.name);

    // ✅ الرد بتنسيق متوافق مع الواجهة
    res.status(201).json({
      message: "تمت الإضافة بنجاح",
      employee: emp,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء الإضافة:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
});

// ==================== قسم الحضور والانصراف ====================

let attendance = [];

// 🟢 جلب سجلات الحضور
app.get("/attendance", (req, res) => {
  res.json(attendance);
});

// 🟢 تسجيل حضور أو انصراف جديد
app.post("/attendance", (req, res) => {
  const record = { id: Date.now(), ...req.body };
  attendance.push(record);
  res.status(201).json(record);
});

// ==================== تشغيل السيرفر ====================
app.listen(port, () => {
  console.log(`✅ Full HR API running on port ${port}`);
});
