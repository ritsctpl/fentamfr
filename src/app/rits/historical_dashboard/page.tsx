import HistoricalTableMain from '@modules/historicalFilterTable/components/HistoricalTableMain'
import { MyProvider } from '@modules/historicalFilterTable/hooks/HistoricalReportContext'
import React from 'react'

const HistoricalDashboardPage = () => {
  return (
    <MyProvider>
    <HistoricalTableMain/>
    </MyProvider>
  )
}

export default HistoricalDashboardPage
