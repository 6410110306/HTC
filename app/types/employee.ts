export type Employee = {
  // Type นี้ยังคงเหมือนเดิม เพราะเป็น Type ที่เราต้องการแปลงให้เป็น
  workdate: string;
  groupid: string;
  groupname: string;
  deptcode: number;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  countscan: number;
  countnotscan: number;
  countperson: number;
  employeeId: string;
  late?: number;
};


export type ReportApiRawData = {
 
  deptcode?: string; 
  deptname?: string;
  deptsbu?: string;
  deptstd?: string;
  countscan?: string;
  deptcodelevel1?: string;
  deptcodelevel2?: string;
  deptcodelevel3?: string;
  deptcodelevel4?: string;
  workdate?: string;
  parentcode?: string | null;
  countnotscan?: string;
  countperson?: string; 
  PersonType?: string | null;
  PersonGroup?: string | null;

  
 
  employeeId?: string;
  groupid?: string;
  groupname?: string;
  late?: string; 
};