'use client';

import CommonAppBar from '@components/CommonAppBar';
import styles from '@modules/bom/styles/bomStyles.module.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FlowChartPdfFirst from '@modules/flowChart/FlowChartPdfFirst';
import FlowChartPdfSecond from './FlowChartPdfSecond';
import FlowChartPdfThird from './FlowChartPdfThird';
import FlowChartPdfFourth from './FlowChartPdfFourth';

const FlowChartMain: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const { t } = useTranslation()

  return (
      <div className={styles.container}>
        <div className={styles.dataFieldNav}>
          <CommonAppBar
            allActivities={[]}
            username={username}
            site={null}
            appTitle={t('flowChart')}
            onSiteChange={null} onSearchChange={function (): void {
              throw new Error('Function not implemented.');
            } } />
        </div>

        <div>
            <FlowChartPdfFirst/>
            <FlowChartPdfSecond/>
            <FlowChartPdfThird/>
            <FlowChartPdfFourth/>
        </div>
      </div>
  );
};

export default FlowChartMain;

