"use client";

import React, { useState } from "react";
import styles from "../styles/customData.module.css";
import { IconButton, InputBase, Paper } from "@mui/material";
import { Button } from 'antd';
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import InstructionModal from "@components/InstructionModal";
import CustomDataManual from "./CustomDataManual";

interface UserGroupBarProps {
  categoryList: Array<{ category: string }>;
  onSearch: (searchTerm: string) => void;
  value: string;
}

const CustomDataBar: React.FC<UserGroupBarProps> = ({
  onSearch,
  value,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>(value); // Initialize with value prop

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm); // Call the onSearch prop function with the search term
  };
  const handleGoClick = () => {
    onSearch(searchTerm)
    // setSearchTerm('')
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchClick();
    }
  };

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>
        <Paper component="form" className={styles.searchPaper}>
          <InputBase
            placeholder={`${t('search')}...`}
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton
            type="button"
            sx={{ p: "10px" }}
            aria-label="search"
            onClick={handleSearchClick}
          >
            <SearchIcon className={styles.searchIcon} />
          </IconButton>
        </Paper>
        {/* <div className={styles.goButton}>
          
          <div style={{display:'flex', padding:'10px'}}>     <Button onClick={handleSearchClick} className={styles.blueButton} variant="contained">
            {t('go')}
          </Button>
           <InstructionModal>
      <CustomDataManual />
     </InstructionModal>
      </div> 
        </div> */}
           <div style={{display:'flex', padding:'10px'}}>      <Button style={{marginRight:"20px"}} type='primary' onClick={handleGoClick}>{t("go") }</Button>
           <InstructionModal  title='Custom Data Maintenance'>
      <CustomDataManual />
     </InstructionModal>
      </div> 
      </div>
    </div>
  );
};

export default CustomDataBar;
