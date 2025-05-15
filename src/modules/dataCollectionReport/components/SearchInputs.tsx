import React, { useState } from 'react';
import { Input, Button, Row, Col, Form } from 'antd';
import { DynamicBrowse } from '@components/BrowseComponent';
import axios from 'axios';
import { RetriveDcGroup, RetrivePcuu } from '@services/podServices';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';

interface SearchInputsProps {
  setData: (data: any[]) => void;
  onViewPdf: () => void;
}
const uiDcGroup: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select DC Group',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'api/rits/',
  tabledataApi: "datacollection-service"
};
const uiPcu: any = {
  pagination: false,
  filtering: false,
  sorting: false,
  multiSelect: false,
  tableTitle: 'Select PCU',
  okButtonVisible: true,
  cancelButtonVisible: true,
  selectEventCall: false,
  selectEventApi: 'pcuheader-service',
  tabledataApi: "pcuheader-service"
};

const SearchInputs: React.FC<SearchInputsProps> = ({ setData, onViewPdf }) => {
  const { t } = useTranslation(); 
  const [dataCollection, setDcGroup] = useState('');
  const [item, setItem] = useState('');
  const [version, setVersion] = useState('');
  const [pcu, setPcu] = useState('');
  const onChangeComponent = (newValues) => {
    // Check if the value array is empty

    if(newValues.length ===0) {
      setDcGroup(""); 
    }
    if (newValues.length > 0) {
    let dcGroupId = newValues[0].dataCollection;
    setDcGroup(dcGroupId); 
    }
    
  
    };
      const onChangeComponentPcu = (newValues) => {
        if(newValues.length ===0) {
          setPcu("");
        }
        if (newValues.length > 0) {
        let pcuId = newValues[0].pcuBO;
         setPcu(pcuId); 
        }
      }
      const handleDcGroupChange = (newValues: any[]) => {
        if(newValues.length ===0) {
          setDcGroup("");
        }
        if (newValues.length > 0) {
          const newValue = newValues[0].dataCollection;
          const newVersion = newValues[0].version;
          localStorage.setItem('revsion', newValues[0].revision);
          setDcGroup(newValue);
          setVersion(newVersion);
         
        }
      };

  const handlePcuChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setPcu("");
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].pcuBO;
      localStorage.setItem('revsion', newValues[0].revision);
      setPcu(newValue);
     
    }
  };


  const handleSearch = async () => {
    const site = parseCookies().site;
    try {
      const response = await RetriveDcGroup(site, {pcu,dataCollection,version});
      setData(response[0]?.parametricMeasuresList);
      console.log(response,"response");

    } catch (error) {
      console.error('Error fetching data:', error);
      // You might want to add error handling here (e.g., showing a notification)
    }
  };

  return (
    <Form layout="horizontal" style={{ margin: '16px', paddingTop: '10px' }} >
      <Row gutter={16} justify="center" align="middle">

        <Col>
          <Form.Item name="shopOrder" label={<strong>{t('dcGroup')}</strong>}>
            <DynamicBrowse 
              uiConfig={uiDcGroup} 
              initial={dataCollection} 
              setOnChangeValue={onChangeComponent}
              onSelectionChange={handleDcGroupChange}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item name="pcu" label={<strong>{t('pcu')}</strong>}>
            <DynamicBrowse 
              uiConfig={uiPcu} 
              initial={pcu} 
              setOnChangeValue={onChangeComponentPcu}
              onSelectionChange={handlePcuChange}
            />
          </Form.Item>
        </Col>
        
        <Col>
          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleSearch} 
              style={{ marginRight: 8 }}
            >
              {t('go')}
            </Button>
            <Button 
              type="primary"
              onClick={onViewPdf}
              style={{ marginRight: 8 }}
            >
              {t('viewPdf')}
            </Button>
            <Button 
              onClick={()=>{setData([]);setDcGroup("");setPcu("");}}
              style={{ marginRight: 8 }}
            >
              {t('clear')}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchInputs;