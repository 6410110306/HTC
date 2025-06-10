// components/ReportFilterForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { ReportApiRawData } from '@/app/types/employee'; // ยังคงใช้ Type นี้สำหรับข้อมูลดิบจาก API หลัก

type Props = {
  // onSearch: ฟังก์ชันที่จะถูกเรียกเมื่อมีการค้นหา
  // employeeId ตรงนี้จะถูกใช้เพื่อส่ง 'scanStatus' แทน ID พนักงานจริง
  onSearch: (filters: { date: string; departmentId: string; employeeId: string }) => void;
  // initialFilters: ค่าเริ่มต้นของฟิลเตอร์
  initialFilters: {
    date: string;
    departmentId: string;
    // employeeId ตรงนี้จะเป็นค่าเริ่มต้นของ scanStatus
    employeeId: string; // เช่น 'all', 'scanned', 'not_scanned'
  };
};

type DepartmentForDropdown = {
  deptcode: string;
  deptname: string;
};

const ReportFilterForm = ({ onSearch, initialFilters }: Props) => {
  const [date, setDate] = useState(initialFilters.date);
  const [departmentId, setDepartmentId] = useState(initialFilters.departmentId);

  // เปลี่ยนชื่อ State จาก employeeId เป็น scanStatus เพื่อความชัดเจน
  const [scanStatus, setScanStatus] = useState(initialFilters.employeeId); // ค่าเริ่มต้นจะเป็น 'all' หรือค่าอื่นที่คุณกำหนด

  const [departments, setDepartments] = useState<DepartmentForDropdown[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // --- Effect สำหรับดึงข้อมูลแผนก ---
  useEffect(() => {
    setLoadingDepartments(true);
    fetch('/api/manpower')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ReportApiRawData[]) => { // ระบุว่า data เป็นอาร์เรย์ของ ReportApiRawData
        // *** บล็อกนี้เป็นบล็อกเดียวที่จำเป็นตามการตอบกลับของ API ของคุณ ***
        if (Array.isArray(data)) {
          const uniqueDepartments: DepartmentForDropdown[] = [];
          const seenDeptcodes = new Set<string>();

          data.forEach(item => {
            const code = item.deptcode;
            const name = item.deptname;

            if (code && name && !seenDeptcodes.has(code)) {
              uniqueDepartments.push({ deptcode: code, deptname: name });
              seenDeptcodes.add(code);
            }
          });
          setDepartments(uniqueDepartments);
        } else {
          // บล็อก 'else' นี้โดยทั่วไปจะไม่ถูกเรียก ถ้า API คืนค่าเป็นอาร์เรย์เสมอ
          // แต่ก็เป็น Fallback ที่ดีสำหรับกรณีที่ได้ข้อมูลมาผิดรูปแบบ
          console.warn('รูปแบบข้อมูลแผนกไม่ถูกต้อง: ข้อมูลไม่ใช่ Array', data);
          setDepartments([]);
        }
      })
      .catch(err => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแผนก:', err);
        setDepartments([]);
      })
      .finally(() => {
        setLoadingDepartments(false);
      });
  }, []);

  // ฟังก์ชันจัดการเมื่อฟอร์มถูก Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ส่ง scanStatus ไปในชื่อ employeeId เพื่อให้เข้ากับ Type ของ onSearch
    onSearch({ date, departmentId, employeeId: scanStatus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ช่องเลือกวันที่ */}
        <div>
          <label className="block mb-1 font-medium">วันที่</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        {/* ช่องเลือกแผนก */}
        <div>
          <label className="block mb-1 font-medium">แผนก</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
            }}
            disabled={loadingDepartments}
          >
            <option key="default-department" value="">
              {loadingDepartments ? 'กำลังโหลดแผนก...' : '-- ทั้งหมด --'}
            </option>
            {departments.map((d, idx) => (
              <option key={`department-${d.deptcode}-${idx}`} value={d.deptcode}>
                {d.deptname}
              </option>
            ))}
          </select>
        </div>
        {/* ช่องเลือกสถานะการสแกน */}
        <div>
          <label className="block mb-1 font-medium">สถานะ</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={scanStatus}
            onChange={(e) => setScanStatus(e.target.value)}
          >
            <option key="scan-status-all" value="all">
              -- ทั้งหมด --
            </option>
            <option key="scan-status-scanned" value="scanned">
              สแกนแล้ว
            </option>
            <option key="scan-status-notscanned" value="not_scanned">
              ยังไม่สแกน
            </option>
          </select>
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        ค้นหา
      </button>
    </form>
  );
};

export default ReportFilterForm;