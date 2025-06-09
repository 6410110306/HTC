'use client';

import { useState } from 'react';
import ReportFilterForm from '@/components/ReportFilterForm';
import { DepartmentTable } from '@/components/DepartmentTable';
import Spinner from '@/components/ui/Spinner';
import Papa from 'papaparse';
import { Employee, ReportApiRawData } from '../types/employee'; // ตรวจสอบ path ให้ถูกต้อง

type Filters = {
  date: string;
  departmentId: string;
  employeeId: string;
};

export default function ReportPage() {
  const [records, setRecords] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const initialFilters: Filters = {
    date: new Date().toISOString().slice(0, 10),
    departmentId: '',
    employeeId: '',
  };

  const handleSearch = async (newFilters: Filters) => {
    setLoading(true);

    const params = new URLSearchParams({
      date: newFilters.date || '',
      departmentId: newFilters.departmentId || '',
      employeeId: newFilters.employeeId || '',
    }).toString();

    try {
      const res = await fetch(`/api/attendance/report?${params}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch report data');
      }
      const rawData: ReportApiRawData[] = await res.json();

      const mappedRecords: Employee[] = rawData.map((rec) => {
        // ใช้ parseInt เพื่อแปลงค่าจาก string เป็น number
        // และใช้ || '0' เพื่อป้องกันค่า null/undefined ก่อนแปลง
        const deptCodeNum = parseInt(rec.deptcode?.toString() || '0', 10);
        const countScanNum = parseInt(rec.countscan || '0', 10);
        const countNotScanNum = parseInt(rec.countnotscan || '0', 10);
        const countPersonNum = parseInt(rec.countperson || '0', 10); // ใช้ค่าจาก API
        const lateNum = parseInt(rec.late?.toString() || '0', 10); // ถ้า API มี late

        return {
          workdate: rec.workdate || '',
          groupid: rec.groupid || '', // ต้องแน่ใจว่า API มี field นี้ หรือลบทิ้งถ้าไม่มี
          groupname: rec.groupname || '', // ต้องแน่ใจว่า API มี field นี้ หรือลบทิ้งถ้าไม่มี
          deptcode: deptCodeNum,
          deptname: rec.deptname || '',
          deptsbu: rec.deptsbu || '',
          deptstd: rec.deptstd || '',
          countscan: countScanNum,
          countnotscan: countNotScanNum,
          countperson: countPersonNum,
          employeeId: rec.employeeId || '', // ต้องแน่ใจว่า API มี field นี้ หรือใช้ค่า default เช่น rec.deptcode + index
          late: lateNum,
        };
      });

      setRecords(mappedRecords);
    } catch (err) {
      console.error('Error fetching attendance report:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_report.csv';
    link.click();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">รายงานการเข้างาน</h1>
      <ReportFilterForm onSearch={handleSearch} initialFilters={initialFilters} />

      {loading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <div className="text-center text-gray-400">ไม่พบข้อมูล</div>
      ) : (
        <>
          <DepartmentTable employees={records} />
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </>
      )}
    </div>
  );
}