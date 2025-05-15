'use client';


import React from 'react';
import ApiConfigMaintenance from '@modules/apiConfiguration/components/ApiConfigurationMaintenance';
import { MyProvider } from '@modules/apiConfiguration/hooks/apiConfigurationContext';
const ApiConfigurationMainPage: React.FC = () => {
  return (
    <MyProvider >
      <ApiConfigMaintenance />;
    </MyProvider>
  )
};

export default ApiConfigurationMainPage;