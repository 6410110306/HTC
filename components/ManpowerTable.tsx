import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PiFileMagnifyingGlassBold } from 'react-icons/pi';
import Spinner from './ui/Spinner'; // ถ้า Spinner อยู่ใน subfolder ของ components
import { Employee } from '@/app/types/employee'; // <-- เปลี่ยน import path ให้ถูกต้อง

type ManpowerTableProps = {
  selectedDate: string;
};

export function ManpowerTable({ selectedDate }: ManpowerTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/department?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        // คาดหวังว่า API นี้จะส่งข้อมูลที่ตรงกับ Type Employee[] โดยตรง
        // หากไม่ตรง คุณจะต้อง map ข้อมูลดิบที่นี่
        const data: Employee[] = await response.json();
        setEmployees(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        ไม่พบข้อมูล
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <table className="min-w-full text-sm text-left border-collapse">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 px-6">deptcode</th>
            <th className="py-2 px-6">deptname</th>
            <th className="py-2 px-6">deptsbu</th>
            <th className="py-2 px-6">deptstd</th>
            <th className="py-2 px-6">Scan</th>
            <th className="py-2 px-6">No Scan</th>
            <th className="py-2 px-6">Person</th>
            <th className="p-0"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr
              key={`${emp.deptcode}-${emp.employeeId || 'noempid'}-${index}`}
            >
              <td className="py-2 px-6">{emp.deptcode}</td>
              <td className="py-2 px-6">{emp.deptname}</td>
              <td className="py-2 px-6">{emp.deptsbu}</td>
              <td className="py-2 px-6">{emp.deptstd}</td>
              <td className="py-2 px-6">{emp.countscan}</td>
              <td className="py-2 px-6">{emp.countnotscan}</td>
              <td className="py-2 px-6">{emp.countperson}</td>
              <td className="p-3">
                {/* ลิงก์ไปยังหน้า Report ของพนักงานแต่ละคน */}
                <Link href={`/report/${emp.employeeId}`}>
                  <PiFileMagnifyingGlassBold
                    size={30}
                    className="text-blue-500 hover:text-blue-700"
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}