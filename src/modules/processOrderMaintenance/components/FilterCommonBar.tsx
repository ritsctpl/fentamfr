'use client';

import React, { useState } from 'react';
import styles from '@modules/processOrderRelease/styles/ProcessOrderRelease.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import InstructionModal from '@components/InstructionModal';
import { Button } from 'antd';
import ProcessOrderManual from './ProcessOrderMaintenancesManual';



interface DataFieldCommonBarProps {
  handleTop50: (searchTerm: string) => void;
  handleSearchClicks: (searchTerm: string) => void;
}

const DataFieldCommonBar: React.FC<DataFieldCommonBarProps> = ({ handleTop50, handleSearchClicks }) => {
  const {t} = useTranslation()
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    handleSearchClicks(searchTerm)
  };

  const handleGoClick = () => {
    handleTop50(searchTerm)
    setSearchTerm('')
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission
      handleSearchClick();
    }
  };
  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            placeholder="Search..."
            className={styles.searchInput}
            value={searchTerm}
            onKeyDown={handleKeyDown} 
            onChange={handleSearchChange}
           
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton
            type="button"
            sx={{ p: '10px' }}
            aria-label="search"
            onClick={handleSearchClick} 
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
      </div>
      {filter && (
        <div className={styles.searchFilter}>
          <InputBase
            style={{ marginLeft: '20px' }}
            placeholder={`${t('search')}...`}
            inputProps={{ 'aria-label': 'filter-input' }}
          />
        </div>
      )}
      <div style={{display:'flex', padding:'10px'}}>      <Button style={{marginRight:"20px"}} type='primary' onClick={handleGoClick}>{t("go") }</Button>
           <InstructionModal  title='Process Order Maintenance'>
      <ProcessOrderManual />
     </InstructionModal>
      </div> 
    </div>
  );
};

export default DataFieldCommonBar;
