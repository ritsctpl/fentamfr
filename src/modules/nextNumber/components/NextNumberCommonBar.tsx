'use client';

import React, { useContext, useState } from 'react';
import styles from '../styles/NextNumberMaintenance.module.css';
import { IconButton, InputBase, Paper } from '@mui/material';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { createNextNumber, deleteNextNumber, retrieveNextNumber, updateNextNumber } from '@services/nextNumberServices';
import { NextNumberContext } from '../hooks/nextNumberContext';
import { message, Button } from 'antd';
import { Modal } from 'antd/lib';


interface CommonBarProps {
  onSearch: (searchTerm: string) => void;
  setFilteredData: ([]) => void;
}

const NextNumberCommonBar: React.FC<CommonBarProps> = ({ onSearch, setFilteredData }) => {
  const { formData, setFormData, resetForm, setResetForm, payloadData, setPayloadData, username } = useContext<any>(NextNumberContext);
  const [filter, setFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { t } = useTranslation()
  let oWCList;
  const handleFilter = () => {
    setFilter(prev => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  const handleFetch = () => {
    const createNextNum = async () => {
      const cookies = parseCookies();
      const site = cookies.site;

      try {
        oWCList = await createNextNumber(payloadData);
        setFilteredData(oWCList);
      }
      catch (error) {
        console.error('Error creating next number:', error);
      }
    };

    createNextNum();
  };

  const handleCreate = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    debugger
    payloadData.site = site;
    payloadData.userId = username;


    if (formData?.defineBy?.toLowerCase() == 'item') {
      payloadData.object = formData.item;
      setFormData((prevData) => ({
        ...prevData,
        itemGroup: ""
      }));
      formData.itemGroup = "";
    }
    else {
      payloadData.object = formData.itemGroup;
      setFormData((prevData) => ({
        ...prevData,
        item: ""
      }));
      formData.item = "";
    }

    const numberType = formData.numberType;
    if (numberType == "PCU release" || numberType == "PCU serialize" || numberType == "Floor Stock Receipt" || numberType == "Batch Number" || numberType == "Process Order") {
      // debugger;
      if (formData?.defineBy?.toLowerCase() == 'item') {
        if (!formData.item) {
          message.error("Item cannot be empty");
          return;
        }
        if (!formData.objectVersion) {
          message.error("Item Version cannot be empty");
          return;
        }
      }
    }
    if (formData?.defineBy?.toLowerCase() == 'itemgroup') {
      if (!formData.itemGroup) {
        message.error("Item Group cannot be empty");
        return;
      }
    }

    const numberBase = formData.numberBase;
    if (!numberBase) {
      message.error("Number base cannot be empty");
      return;
    }

    const currentSequence = formData.currentSequence;
    if (!currentSequence) {
      message.error("Current Sequence cannot be empty");
      return;
    }

    const minSequence = +formData.minSequence;
    const maxSequence = +formData.maxSequence;
    if (minSequence > maxSequence) {
      message.error("Min Sequence cannot be greater than max sequence");
      return;
    }

    if (currentSequence < minSequence || currentSequence > maxSequence) {
      message.error("Current Sequence must be " + "between " + minSequence + " to " + maxSequence);
      return;
    }

    const sequenceLength = formData.sequenceLength;
    if (sequenceLength <= 0) {
      message.error("Sequence Length must be a positiive integer");
      return;
    }

    formData.userBO = site + "," + username;
    formData.userId = username;
    formData.site = site;

    if (formData.commitNextNumberChangesImmediately == "") {
      formData.commitNextNumberChangesImmediately = false;
    }
    if (formData.createContinuousSfcOnImport == "") {
      formData.createContinuousSfcOnImport = false;
    }

    const parsedFormData: FormData = {
      ...formData,
      numberBase: parseInt(formData.numberBase.toString(), 10),
      sequenceLength: parseInt(formData.sequenceLength.toString(), 10),
      minSequence: parseInt(formData.minSequence.toString(), 10),
      maxSequence: parseInt(formData.maxSequence.toString(), 10),
      warningThreshold: parseInt(formData.warningThreshold.toString(), 10),
      incrementBy: parseInt(formData.incrementBy.toString(), 10),
      currentSequence: parseInt(formData.currentSequence.toString(), 10)
    };


    console.log("Create request: ", parsedFormData)
    try {
      const response = await createNextNumber(parsedFormData);
      console.log("Create response: ", response);
      if (response.errorCode)
        message.error(response.message);
      else {
        message.success(response.message_details?.msg);
        setFormData((prevData) => ({
          // ...prevData,
          ...response.response
        }));
        setPayloadData((prevData) => ({
          ...response.response
        }))
      }
    }

    catch (error) {
      console.error('Error creating next number:', error);
    }
  }

  const handleUpdate = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    payloadData.site = site;
    payloadData.userId = username;
    if (formData?.defineBy?.toLowerCase() == 'item') {
      payloadData.object = formData.item;
      setFormData((prevData) => ({
        ...prevData,
        itemGroup: ""
      }));
      formData.itemGroup = "";
    }
    else {
      payloadData.object = formData.itemGroup;
      setFormData((prevData) => ({
        ...prevData,
        item: ""
      }));
      formData.item = "";
    }
    const numberType = formData.numberType;
    if (numberType == "PCU release" || numberType == "PCU serialize" || numberType == "Floor Stock Receipt" || numberType == "Batch Number" || numberType == "Process Order") {
      if (formData?.defineBy?.toLowerCase() == 'item') {
        if (!formData.item) {
          message.error("Item cannot be empty");
          return;
        }
        if (!formData.objectVersion) {
          message.error("Item Version cannot be empty");
          return;
        }
      }
    }
    if (formData?.defineBy?.toLowerCase() == 'itemgroup') {
      if (!formData.itemGroup) {
        message.error("Item Group cannot be empty");
        return;
      }
    }

    const numberBase = formData.numberBase;
    if (!numberBase) {
      message.error("Number base cannot be empty");
      return;
    }

    const currentSequence = formData.currentSequence;
    if (!currentSequence) {
      message.error("Current Sequence cannot be empty");
      return;
    }

    const minSequence = +formData.minSequence;
    const maxSequence = +formData.maxSequence;
    if (minSequence > maxSequence) {
      message.error("Min Sequence cannot be greater than max sequence");
      return;
    }

    if (currentSequence < minSequence || currentSequence > maxSequence) {
      message.error("Current Sequence must be " + "between " + minSequence + " to " + maxSequence);
      return;
    }

    const sequenceLength = formData.sequenceLength;
    if (sequenceLength <= 0) {
      message.error("Sequence Length must be a positiive integer");
      return;
    }

    formData.userBO = site + "," + username;
    formData.userId = username;
    formData.site = site;

    const parsedFormData: FormData = {
      ...formData,
      numberBase: parseInt(formData.numberBase.toString(), 10),
      sequenceLength: parseInt(formData.sequenceLength.toString(), 10),
      minSequence: parseInt(formData.minSequence.toString(), 10),
      maxSequence: parseInt(formData.maxSequence.toString(), 10),
      warningThreshold: parseInt(formData.warningThreshold.toString(), 10),
      incrementBy: parseInt(formData.incrementBy.toString(), 10),
      currentSequence: parseInt(formData.currentSequence.toString(), 10)
    };

    console.log("Update request: ", parsedFormData)
    try {
      const response = await updateNextNumber(parsedFormData);
      console.log("Update response: ", response);
      if (response.errorCode)
        message.error(response.message);
      else{
        message.success(response.message_details.msg);
        setPayloadData((prevData) => ({
          ...response.response,
          sampleNextNumber: response.response.sampleNextNumber
        }))
      }
    }

    catch (error) {
      console.error('Error updating top 50 WC:', error);
    }
  }

  const handleRetrieve = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    const NumberType = formData?.numberType;
    if (NumberType == "PCU release" || NumberType == "PCU serialize" || NumberType == "Floor Stock Receipt" || NumberType == "Batch Number" || NumberType == "Process Order") {
      if (formData?.defineBy?.toLowerCase() == 'item') {
        if (!formData.item) {
          message.error("Item cannot be empty");
          return;
        }
        if (!formData.objectVersion) {
          message.error("Item Version cannot be empty");
          return;
        }
      }
    }
    if (formData?.defineBy?.toLowerCase().replace(' ', '') == 'itemgroup') {
      if (!formData.itemGroup) {
        message.error("Item Group cannot be empty");
        return;
      }
    }

    formData.site = site;
    debugger;
    if (formData != undefined ) {
      if (formData?.defineBy?.toLowerCase().replace(' ', '') == 'item') {
        formData.object = formData.item;
      }

      if (formData?.defineBy?.toLowerCase().replace(' ', '') == 'itemgroup') {
        formData.object = formData.itemGroup;
      }
      // payloadData.numberType = formData.numberType;
      // payloadData.orderType = formData.orderType;
      // payloadData.defineBy = formData.defineBy;
      // payloadData.objectVersion = formData.objectVersion;
      formData.userId = username;
      formData.userBO = site + "," + username;
      // if (formData.defineBy?.toLowerCase() == 'item')
      //   payloadData.object = formData.item
      // else
      //   payloadData.object = formData.itemGroup

      console.log("Retrieve request: ", formData)
      try {
        const response = await retrieveNextNumber(formData);
        console.log("Retrieve response: ", response);
        if (response.errorCode) {
          if (response.errorCode == "5101") {
            message.error(response.message);
          }
        }
        else {
          if (response?.defineBy?.toLowerCase() == 'item') {
            response.item = response.object;
          }
          else {
            response.itemGroup = response.object;
          }
          setFormData(response);
        }

        // setPayloadData((prevData) => ({
        //   // ...prevData,
        //   ...response
        // }))

      }

      catch (error) {
        console.error('Error retrieveing next number:', error);
      }
    }
  }
  const handleDelete = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    if (formData?.defineBy?.toLowerCase() == 'item') {
      payloadData.object = formData.item;
      setFormData((prevData) => ({
        ...prevData,
        itemGroup: ""
      }));
      formData.itemGroup = "";
    }
    else {
      payloadData.object = formData.itemGroup;
      setFormData((prevData) => ({
        ...prevData,
        item: ""
      }));
      formData.item = "";
    }

    formData.userBO = site + "," + username;
    formData.userId = username;
    formData.site = site;

    if (formData.commitNextNumberChangesImmediately == "") {
      formData.commitNextNumberChangesImmediately = false;
    }
    if (formData.createContinuousSfcOnImport == "") {
      formData.createContinuousSfcOnImport = false;
    }

    const parsedFormData: FormData = {
      ...formData,
      numberBase: parseInt(formData.numberBase.toString(), 10),
      sequenceLength: parseInt(formData.sequenceLength.toString(), 10),
      minSequence: parseInt(formData.minSequence.toString(), 10),
      maxSequence: parseInt(formData.maxSequence.toString(), 10),
      warningThreshold: parseInt(formData.warningThreshold.toString(), 10),
      incrementBy: parseInt(formData.incrementBy.toString(), 10),
      currentSequence: parseInt(formData.currentSequence.toString(), 10)
    };
    if (formData.defineBy?.toLowerCase() == 'item') {
      payloadData.object = formData.item
      formData.object = formData.item
    }
    else {
      payloadData.object = formData.itemGroup;
      formData.object = formData.item;
    }
    console.log("Delete request: ", formData)
    const NumberType = formData.numberType;
    if (NumberType == "PCU release" || NumberType == "PCU serialize" || NumberType == "Floor Stock Receipt" || NumberType == "Batch Number" || NumberType == "Process Order") {
      if (formData?.defineBy?.toLowerCase() == 'item') {
        if (!formData.item) {
          message.error("Item cannot be empty");
          return;
        }
        if (!formData.objectVersion) {
          message.error("Item Version cannot be empty");
          return;
        }
      }
    }
    if (formData?.defineBy?.toLowerCase().replace(' ', '') == 'itemgroup') {
      if (!formData.itemGroup) {
        message.error("Item Group cannot be empty");
        return;
      }
    }
    Modal.confirm({
      title: t('confirm'),
      content: t('deleteMsg'),
      okText: t('ok'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          const response = await deleteNextNumber(formData);
          console.log("Delete response: ", response);
          if (response.errorCode)
            message.error(response.message);
          else {
            message.success(response.message_details.msg);
            handleClear()
          }
        }

        catch (error) {
          console.error('Error deleting next number:', error);
        }
      },
      onCancel() {
        // console.log('Action canceled');
      },
    });

  }

  const handleClear = () => {
    setResetForm(true);
    setFormData((prevData) => ({
      ...prevData,
      prefix: "",
      suffix: "",
      description: "",
      sampleNextNumber: "",
      object: "",
      objectVersion: "",
      item: "",
      itemGroup: "",
      containerInput: "",
      currentSequence: "",
      minSequence: 1,
      maxSequence: 100,
      warningThreshold: "",
      incrementBy: "",
      nextNumberActivity: "",
      createContinuousSfcOnImport: false,
      commitNextNumberChangesImmediately: false,
    }));
  }

  return (
    <div className={styles.dataField}>
      <div className={styles.datafieldNav}>

        <h3 style={{ marginLeft: "1%" }}>{t('createNextNumber')}</h3>
        <div className={styles.goButton}>
          <Button onClick={handleCreate} className={styles.cancelButton} >
            {t("create")}
          </Button>
          <Button onClick={handleRetrieve} className={styles.cancelButton} >
            {t("retrieve")}
          </Button>
          <Button onClick={handleUpdate} className={styles.cancelButton} >
            {t("update")}
          </Button>
          <Button onClick={handleDelete} className={styles.cancelButton} >
            {t("delete")}
          </Button>
          <Button onClick={handleClear} className={styles.cancelButton} >
            {t("clear")}
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

export default NextNumberCommonBar;
