'use client';


import React from 'react';
import ApiConfigMaintenance from '@modules/componentBuilder/components/ComponentBuilderMain';
import { MyProvider } from '@modules/componentBuilder/hooks/componentBuilderContext';
const ApiConfigurationMainPage: React.FC = () => {
  return (
    <MyProvider >
      <ApiConfigMaintenance />
    </MyProvider>
  )
};

export default ApiConfigurationMainPage;