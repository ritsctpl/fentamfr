'use client';


import React from 'react';
import { MyProvider } from '@modules/workFlow/hooks/workFlowContext';
import WorkFlowMaintenance from '@modules/workFlow/components/WorkFlowMaintenance';
const WorkFlowPage: React.FC = () => {
  return (
    <MyProvider >
      <WorkFlowMaintenance />;
    </MyProvider>
  )
};

export default WorkFlowPage;