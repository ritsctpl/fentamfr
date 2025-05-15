'use client';

import DownTimeTable from '@modules/downTime1/components/DownTime';
import DownTimeMain from '@modules/downTime1/components/main';
import { MyProvider } from '@modules/downTime1/hooks/downTimeContext';
import React from 'react';

const DownTimeMainPage: React.FC = () => {
  return (
    <MyProvider >
      <DownTimeMain />
    </MyProvider>
  )
};

export default DownTimeMainPage;