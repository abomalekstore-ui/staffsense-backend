import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let employees = [
  { id: 1, name: "أحمد محمد", position: "مدير الموارد البشرية" },
  { id: 2, name: "سارة علي", position: "محاسبة" }
];

// 🧾 عرض كل الموظفين
app.get("/api/employees", (req, res) => {
  res.json(employees);
});

// ➕ إضافة موظف جديد
app.post("/api/employees", (req, res) => {
  const newEmp = { id: Date.now(), ...req.body };
  employees.push(newEmp);
  res.json(newEmp);
});

// 🗑️ حذف موظف
app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  employees = employees.filter(emp => emp.id != id);
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("✅ StaffSense API is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
