'use client';

import React, { useContext, useState } from 'react';
import styles from '../styles/DataTypeMaintenance.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { parseCookies } from 'nookies';
import { retrieveTop50DataType } from '@services/dataTypeService';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'antd';
import { DataTypeContext } from '../hooks/DataTypeContext';

interface DataTypeCommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const DataTypeCommonBar: React.FC<DataTypeCommonBarProps> = ({ onSearch, setFilteredData }) => {
  const {setCategory} = useContext(DataTypeContext)
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation();
  let itemTop50List;
  const [selectedOption, setSelectedOption] = useState<string>('Assembly');

  const handleFilter = () => {
    setFilter(prev => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleItemFetch = () => {
    const fetchItemData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        itemTop50List = await retrieveTop50DataType(site);
        console.log("Top 50: ", itemTop50List);
        setFilteredData(itemTop50List);
      }
      catch (error) {
        console.error('Error fetching data fields:', error);
      }
    };

    fetchItemData();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default form submission
      handleSearchClick();
    }
  };

  const handleSelectChange = (value: string) => {
    debugger
    setSelectedOption(value);
    setCategory(value);
  };

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Paper component="form" className={styles.searchPaper}>
            <InputBase
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
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
          <Select
            value={selectedOption}
            onChange={handleSelectChange}
            className={styles.selectDropdown}
            style={{ width: 120, marginLeft: '10px' }}
          >
            <Select.Option value="Assembly">Assembly</Select.Option>
            <Select.Option value="NC">NC</Select.Option>
            <Select.Option value="Packing Container">Packing Container</Select.Option>
            <Select.Option value="Packing PCU">Packing PCU</Select.Option>
            <Select.Option value="RMA PCU">RMA PCU</Select.Option>
            <Select.Option value="RMA Shop Order">RMA Shop Order</Select.Option>
            <Select.Option value="PCU">PCU</Select.Option>
          </Select>
        </div>
        <div className={styles.goButton}>
          <Button onClick={handleItemFetch} type='primary'>
            {t('go')}
          </Button>
        </div>
      </div>
      {filter && (
        <div className={styles.searchFilter}>
          <InputBase
            style={{ marginLeft: '20px' }}
            placeholder="Search..."
            inputProps={{ 'aria-label': 'filter-input' }}
          />
        </div>
      )}
    </div>
  );
};

export default DataTypeCommonBar;
