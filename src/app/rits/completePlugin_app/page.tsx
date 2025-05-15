
'use client';

import CompleteMain from '@modules/completePlugin/components/CompleteMain';
import React from 'react';

const CompletePluginPage: React.FC = () => {
  return <CompleteMain
    filterFormData={undefined} selectedRowData={[]} call1={undefined} setFilterFormData={undefined} setPhaseId={undefined}
    onRemoveContainer={undefined} buttonId={undefined} call2={undefined} phaseByDefault={undefined} data={undefined} selectedContainer={undefined} buttonLabel={undefined} setCall1={function (value: number): void {
      throw new Error('Function not implemented.');
    }} setSelectedRowData={undefined} />;
};

export default CompletePluginPage;

