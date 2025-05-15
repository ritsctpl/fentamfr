
'use client';

import OeeDashBoard from '@modules/oee_panel/OeeDashBoard';
import OeeAnalytics from '@modules/oee_process/components/OeeAnalytics';
import { MyProvider } from '@modules/oee_process/hooks/filterData';
import React from 'react';

const OeeMaintenancePage: React.FC = () => {
  return(
  <MyProvider>
  <OeeAnalytics />;
  </MyProvider>)
};

export default OeeMaintenancePage;

