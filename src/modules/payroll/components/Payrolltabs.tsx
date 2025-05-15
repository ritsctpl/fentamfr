import CommonAppBar from '@components/CommonAppBar'
import React, { useState } from 'react'
import { useTranslation } from "react-i18next";
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import PayslipPDF from './payslippdf/payslippdf';
import PayrollTemplate from './payrolltemplate/PayrollTemplate';
import Payrollsystem from './payrollsystem/Payrollsystem';
import PayrollGeneration from './payrollgeneration/PayrollGeneration';
import {MyProvider,usePayrollContext} from "../hooks/payrollcontex"


function Payrolltabs() {
    //init function
    const { t } = useTranslation();
    //state
    const [username, setUsername] = useState<string | null>(null);
    //Tabs Data
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Payroll Template',
            children: <PayrollTemplate/>,
        },
        {
            key: '2',
            label: 'Payroll System ',
            children: <Payrollsystem/>
        },
        {
            key: '3',
            label: 'Payroll Generation',
            children: <PayrollGeneration/>,
        },
        {
            key: '4',
            label: 'Payslip PDF Template',
            children:<PayslipPDF employeeData={{
                employeeId: "EMP001",
                employeeName: "TEST EMPLOYEE",
                designation: "Software Engineer",
                department: "IT",
                dateOfJoining: "2023-01-15",
                uan: "123456789012",
                pfNo: "PF12345",
                esiNo: "ESI98765",
                bank: "ABC Bank",
                accountNo: "1234567890"
              }} salaryData={{
                grossWages: 50000,
                workingDays: 22,
                lopDays: 1,
                leaves: 2,
                paidDays: 21,
                earnings: {
                  basic: 30000,
                  hra: 10000,
                  conveyanceAllowance: 3000,
                  medicalAllowance: 2000,
                  otherAllowances: 5000,
                  totalEarnings: 50000,
                },
                deductions: {
                  epf: 3600,
                  esi: 750,
                  professionalTax: 200
                }
              }}/>,
        },
    ];
    // const { } = usePayrollContext();
    return <>
    <MyProvider>
        <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t("Payroll")}
            onSiteChange={null}
            onSearchChange={() => { }}
        />
        <div style={{ padding: '10px' }}>
            <Tabs size="middle" tabPosition="top" defaultActiveKey="1" items={items} tabBarStyle={{ marginBottom: 0 }} />
        </div>
    </MyProvider>
    </>
}

export default Payrolltabs