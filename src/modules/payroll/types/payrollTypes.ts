export interface PayrollTemplateData {
    key: string;
    "Template Name": string;
    Earnings: number;
    Deductions: number;
}
export interface PayrollTemplateDataBody {
    "Template Name": string;
    Description?: string;
    CreatedOn?: string;
    ModifiedOn?: string;
}
export interface PayrollTemplateBodyProps {
    isOpen: boolean;
    onClose: () => void;
    onFullScreenClose: () => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
    selectedTemplate: PayrollTemplateDataBody | null;
}
export interface ComponentEntry {
    key: string;
    componentName: string;
    valueType: string;
}
export interface PreviewTableData {
    key: string;
    componentName: string;
    value: string | number;
}
// Payroll Generation Types
export interface PayrollGenerationData {
    key: string;
    empId: string;
    userName: string;
    role: string;
    department: string;
    overtimeHours: number;
    totalDaysWorked: number;
    paidLeave: number;
    attendance: number;
    grossSalary: number;
    totalDeductions: number;
    netPay: number;
}

export interface PayrollMeta {
    workingDays: number;
    weekends: number;
    holidays: number;
    totalDaysInMonth: number;
    payPeriod: string;
    payDate: string;
}

// Payroll System Types
export interface PayrollsystemData {
    key: string;
    Emp_ID: string;
    Name: string;
    Role: string;
    ctc: number;
    "Payroll Template": string;
}
export interface PayrollSystemBodyProps {
    isOpen: boolean;
    onClose: () => void;
    onFullScreenClose: () => void;
    isFullScreen: boolean;
    setIsFullScreen: (value: boolean) => void;
}