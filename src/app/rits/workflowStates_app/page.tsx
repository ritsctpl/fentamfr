'use client';


import React from 'react';
import { MyProvider } from '@modules/workflowStates/hooks/WorkflowStatesContext';
import WorkflowStatesMain from '@modules/workflowStates/components/WorkflowStatesMaintenance';
const ApiConfigurationMainPage: React.FC = () => {
  return (
    <MyProvider >
      <WorkflowStatesMain />
    </MyProvider>
  )
};

export default ApiConfigurationMainPage;