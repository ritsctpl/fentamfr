'use client';


import React from 'react';
import WorkFlowConfigurationMaintenance from '@modules/workflowConfiguration/components/WorkFlowMaintenance';
import { MyProvider } from '@modules/workflowConfiguration/hooks/WorkFlowConfigurationContext';
const WorkFlowConfigurationPage: React.FC = () => {
  return (
    <MyProvider >
      <WorkFlowConfigurationMaintenance />;
    </MyProvider>
  )
};

export default WorkFlowConfigurationPage;