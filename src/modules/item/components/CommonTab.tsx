import React, { useState } from 'react';
import { Tabs, Tab, Typography, Box } from '@mui/material';
import styles from '../styles/CommonTab.module.css';

interface TabData {
  label: string;
  content: React.ReactNode;
}

interface DynamicTabsProps {
  tabsData: TabData[];
  onTabChange?: (tabLabel: string) => void; 
}

const DynamicTabs: React.FC<DynamicTabsProps> = ({ tabsData, onTabChange }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (onTabChange) {
      onTabChange(tabsData[newValue].label); 
    }
  };

  return (
    <Box className={styles.tabContainer}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="dynamic tabs"
      >
        {tabsData.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            className={styles.tabLabel}
            id={`tab-${index}`}
            aria-controls={`tab-panel-${index}`}
          />
        ))}
      </Tabs>
      {tabsData.map((tab, index) => (
        <TabPanel
          value={value}
          index={index}
          key={index}
        >
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tab-panel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={styles.tabPanel}
    >
      {value === index && (
        <Box className={styles.tabContent}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export default DynamicTabs;
