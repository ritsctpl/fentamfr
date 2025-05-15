import OeeManagementReportMain from '@modules/oee_management_report/OeeManagementReportMain';
import { MyProvider } from '@modules/overallDashBoard/hooks/managementReport';
import OverallDashBoardMain from '@modules/overallDashBoard/overallDashboard';
import React from 'react'

function OverallDashBoardPage() {
  return (
    <MyProvider >
    <OverallDashBoardMain />
    </MyProvider>
  )
}

export default OverallDashBoardPage;