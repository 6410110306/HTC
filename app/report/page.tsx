// pages/ReportPage.tsx
'use client';

import { useState, useEffect } from 'react';
import ReportFilterForm from '@/components/ReportFilterForm';
import { DepartmentTable } from '@/components/DepartmentTable'; // นำเข้า DepartmentTable
import Spinner from '@/components/ui/Spinner';
import Papa from 'papaparse';
import { Employee, ReportApiRawData } from '../types/employee';

type Filters = {
  date: string;
  departmentId: string;
  employeeId: string; // ตรงนี้เก็บค่า scanStatus: 'all', 'scanned', 'not_scanned'
};

export default function ReportPage() {
  const [records, setRecords] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentFilters, setCurrentFilters] = useState<Filters>(() => ({
    date: new Date().toISOString().slice(0, 10),
    departmentId: '',
    employeeId: 'all', // กำหนดค่าเริ่มต้นของสถานะสแกนเป็น 'all'
  }));

  const handleSearch = async (newFilters: Filters) => {
    console.log('Searching with filters:', newFilters);
    setCurrentFilters(newFilters);
  };

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);

      const params = new URLSearchParams({
        date: currentFilters.date || '',
        departmentId: currentFilters.departmentId || '',
        employeeId: currentFilters.employeeId || '', // ค่านี้คือ scanStatus
      }).toString();

      try {
        const res = await fetch(`/api/attendance/report?${params}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch report data');
        }
        const rawData: ReportApiRawData[] = await res.json();

        const mappedRecords: Employee[] = rawData.map((rec) => {
          const deptCodeNum = parseInt(rec.deptcode?.toString() || '0', 10);
          const countScanNum = parseInt(rec.countscan || '0', 10);
          const countNotScanNum = parseInt(rec.countnotscan || '0', 10);
          const countPersonNum = parseInt(rec.countperson || '0', 10);
          const lateNum = parseInt(rec.late?.toString() || '0', 10);

          return {
            workdate: rec.workdate || '',
            groupid: rec.groupid || '',
            groupname: rec.groupname || '',
            deptcode: deptCodeNum,
            deptname: rec.deptname || '',
            deptsbu: rec.deptsbu || '',
            deptstd: rec.deptstd || '',
            countscan: countScanNum,
            countnotscan: countNotScanNum,
            countperson: countPersonNum,
            employeeId: rec.employeeId || '',
          };
        });
        setRecords(mappedRecords);
      } catch (err) {
        console.error('Error fetching attendance report:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, [currentFilters]);

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
      <ReportFilterForm onSearch={handleSearch} initialFilters={currentFilters} />

      {loading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <div className="text-center text-gray-400">ไม่พบข้อมูล</div>
      ) : (
        <>
          {/* *** ส่งค่า scanStatus ไปให้ DepartmentTable *** */}
          <DepartmentTable
            employees={records}
            scanStatus={currentFilters.employeeId} // ส่งสถานะสแกนที่เลือกไป
          />
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