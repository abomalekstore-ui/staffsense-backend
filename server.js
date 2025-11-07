import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let employees = [
  { id: 1, name: "أحمد علي" },
  { id: 2, name: "سارة محمد" },
  { id: 3, name: "خالد عبد الله" },
];

// جداول البيانات
let attendance = []; // [{id, employeeId, date, checkIn, checkOut, lateMinutes, permissionType, overtimeHours}]
let leaves = []; // [{id, employeeId, type: "اعتيادي"/"عارضة", days}]
let overtime = []; // [{id, employeeId, date, hours}]

// ============= 🧭 موظفين =============
app.get("/employees", (req, res) => {
  res.json(employees);
});

// ============= 🕒 الحضور والانصراف =============
app.get("/attendance", (req, res) => {
  res.json(attendance);
});

app.post("/attendance", (req, res) => {
  const record = req.body;
  record.id = Date.now();

  // حساب التأخير
  const [h, m] = record.checkIn.split(":").map(Number);
  const arrivalMinutes = h * 60 + m;
  const lateMinutes = arrivalMinutes > 480 ? arrivalMinutes - 480 : 0; // بعد 8:00 ص

  // تصريح شخصي صباحي أو مسائي
  let permissionType = null;
  if (lateMinutes > 15) {
    if (h < 10) permissionType = "تصريح شخصي (1 ساعة)";
    else if (h >= 10 && h < 10.5) permissionType = "تصريح شخصي (2 ساعة)";
  } else if (h >= 13 && h < 14) permissionType = "تصريح شخصي مسائي (2 ساعة)";
  else if (h >= 14) permissionType = "تصريح شخصي مسائي (1 ساعة)";

  // العمل الإضافي
  const [oh, om] = record.checkOut.split(":").map(Number);
  const outMinutes = oh * 60 + om;
  const overtimeHours = outMinutes > 1020 ? (outMinutes - 900) / 60 : 0; // بعد 15:00 يعتبر إضافي

  record.lateMinutes = lateMinutes;
  record.permissionType = permissionType;
  record.overtimeHours = overtimeHours;
  record.date = new Date().toISOString().split("T")[0];

  attendance.push(record);

  // تسجيل الإضافي في جدول منفصل
  if (overtimeHours > 0) {
    overtime.push({
      id: Date.now(),
      employeeId: record.employeeId,
      date: record.date,
      hours: overtimeHours,
    });
  }

  res.json({ success: true, record });
});

// تعديل سجل
app.put("/attendance/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = attendance.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: "لم يتم العثور على السجل" });
  attendance[index] = { ...attendance[index], ...req.body };
  res.json({ success: true, record: attendance[index] });
});

// ============= 🏖️ الإجازات =============
app.get("/leaves", (req, res) => {
  res.json(leaves);
});

app.post("/leaves", (req, res) => {
  const { employeeId, type, days } = req.body;
  const leave = { id: Date.now(), employeeId, type, days };
  leaves.push(leave);
  res.json({ success: true, leave });
});

app.put("/leaves/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = leaves.findIndex((l) => l.id === id);
  if (index === -1) return res.status(404).json({ error: "لم يتم العثور على الإجازة" });
  leaves[index] = { ...leaves[index], ...req.body };
  res.json({ success: true, leave: leaves[index] });
});

// ============= ⏱️ الإضافي =============
app.get("/overtime", (req, res) => {
  res.json(overtime);
});

// ============= 📊 التقارير =============
app.get("/reports", (req, res) => {
  const report = employees.map((emp) => {
    const empAttendance = attendance.filter((a) => a.employeeId === emp.id);
    const empLeaves = leaves.filter((l) => l.employeeId === emp.id);
    const empOvertime = overtime.filter((o) => o.employeeId === emp.id);

    const totalLate = empAttendance.reduce((sum, a) => sum + a.lateMinutes, 0);
    const totalPermissions = empAttendance.filter((a) => a.permissionType).length;
    const totalOvertime = empOvertime.reduce((sum, o) => sum + o.hours, 0);

    return {
      name: emp.name,
      attendanceDays: empAttendance.length,
      leaveDays: empLeaves.reduce((s, l) => s + l.days, 0),
      lateMinutes: totalLate,
      permissions: totalPermissions,
      overtimeHours: totalOvertime,
    };
  });

  res.json(report);
});

app.get("/", (req, res) => {
  res.send("✅ StaffSense Backend is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
