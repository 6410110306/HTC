// components/DepartmentTable.tsx
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from "react-icons/pi";

// Type สำหรับข้อมูล Employee ที่จะรับเข้ามาในตาราง
// ตรวจสอบว่าตรงกับข้อมูลที่ map มาจาก API (ReportApiRawData -> Employee)
type Employee = {
  workdate: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  countscan: number;
  countnotscan: number;
  countperson: number;
  employeeId?: string;

};

// Type สำหรับ Props ของ DepartmentTable
export type DepartmentTableProps = {
  employees: Employee[];
  // *** เพิ่ม prop scanStatus เข้ามา ***
  scanStatus: string; // ค่านี้คือ 'all', 'scanned', 'not_scanned'
};

export function DepartmentTable({ employees, scanStatus }: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">workdate</th>
            <th className="py-2 px-6">deptcode</th>
            <th className="py-2 px-6">deptname</th>
            <th className="py-2 px-6">deptsbu</th>
            <th className="py-2 px-6">deptstd</th>
            {/* *** เงื่อนไขการแสดงคอลัมน์ Scan *** */}
            {scanStatus !== 'not_scanned' && (
              <th className="py-2 px-6">Scan</th>
            )}
            {/* *** เงื่อนไขการแสดงคอลัมน์ No Scan *** */}
            {scanStatus !== 'scanned' && (
              <th className="py-2 px-6">No Scan</th>
            )}
            <th className="py-2 px-6">Person</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={`${emp.deptcode}-${emp.workdate}-${emp.employeeId ?? 'noempid'}-${index}`} className="border-b border-gray-100 last:border-b-0">
              <td className="py-2 px-6">{emp.workdate}</td>
              <td className="py-2 px-6">{emp.deptcode}</td>
              <td className="py-2 px-5">{emp.deptname}</td>
              <td className="py-2 px-6">{emp.deptsbu}</td>
              <td className="py-2 px-6">{emp.deptstd}</td>
              {/* *** เงื่อนไขการแสดงข้อมูลเซลล์ Scan *** */}
              {scanStatus !== 'not_scanned' && (
                <td className="py-2 px-6">{emp.countscan}</td>
              )}
              {/* *** เงื่อนไขการแสดงข้อมูลเซลล์ No Scan *** */}
              {scanStatus !== 'scanned' && (
                <td className="py-2 px-6">{emp.countnotscan}</td>
              )}
              <td className="py-2 px-6">{emp.countperson}</td>
              <td className="p-3">
                {emp.employeeId ? (
                    <Link href={`../report/${emp.employeeId}/page`}>
                      <PiFileMagnifyingGlassBold size={30} className="text-blue-500 hover:text-blue-700" />
                    </Link>
                ) : (
                    // อาจแสดง Icon ที่ disabled หรือซ่อนไปเลยถ้าไม่มี employeeId ที่จะลิงก์ไป
                    <PiFileMagnifyingGlassBold size={30} className="text-gray-400 cursor-not-allowed" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}