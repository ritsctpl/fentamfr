'use client'
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@context/AuthContext';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import styles from '@modules/cycleTimeMaintenance/styles/CycleTime.module.css';
import { useTranslation } from 'react-i18next';
import { Form, Table, Modal, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import CycleDynamicForm from './CycleDynamicForm';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import { CycleTimeRequest, defaultCycleTimeRequest } from '../types/cycleTimeTypes';
import CycleForm from './CycleForm';
import CommonTable from './CommonTable';
import { fetchCycleTimes, retriveCycleTimeRow } from '@services/cycleTimeService';
import { parseCookies } from 'nookies';

interface DecodedToken {
    preferred_username: string;
}

interface FormData {
    resource: string;
    resourceType: string;
    workCenter: string;
    operation: string;
    operationVersion?: string;
    item: string;
    itemVersion?: string;
    targetQuantity: number;
    time: any;
    cycleTime: number;
    productionTime: number;
}

const CycleScreen: React.FC = () => {
    const cookies = parseCookies();
    const [site, setSite] = useState<string | null>(cookies.site);
    const [formData, setFormData] = useState<CycleTimeRequest>(defaultCycleTimeRequest);
    const [isFormDisabled, setIsFormDisabled] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [formChange, setFormChange] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);
    const { isAuthenticated, token } = useAuth();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [instructionVisible, setInstructionVisible] = useState(false);
    const [call, setCall] = useState<number>(0);
    const [selected, setSelected] = useState<object>({});
    const [selectRowData, setSelectRowData] = useState<any>(null);

    useEffect(() => {
        const fetchCycleTime = async () => {
          if (isAuthenticated && token) {
            try {
              const decryptedToken = decryptToken(token);
              const decoded: DecodedToken = jwtDecode(decryptedToken);
              setUsername(decoded.preferred_username);
            } catch (error) {
              console.error('Error decoding token:', error);
            }
          }
    
    
          try {
            const item = await fetchCycleTimes(site);
            const itemWithoutId = item.map(({ itemId,material,materialVersion, ...rest }) => rest);
            setFilteredData(itemWithoutId);
            setCall(0)
          } catch (error) {
            console.error('Error fetching data fields:', error);
          }
        };
    
        fetchCycleTime();
      }, [isAuthenticated, username, call]);

    useEffect(() => {
        const fetchCycleTime = async () => {
            if (isAuthenticated && token) {
                try {
                    const decryptedToken = decryptToken(token);
                    const decoded: DecodedToken = jwtDecode(decryptedToken);
                    setUsername(decoded.preferred_username);
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        }
        fetchCycleTime();
    }, [isAuthenticated, token]);

    const handleSiteChange = (newSite: string) => {
        console.log(newSite, 'new site')
    };

    const fieldsFormData = [
        'resource',
        'resourceType',
        'workCenter',
        'operation',
        'operationVersion',
        'item',
        'itemVersion',
        'targetQuantity',
        'time',
        'cycleTime',
        'manufacturedTime',
    ];

    const handleValuesChange = (changedValues: any) => {
        setFormData(prevData => ({
            ...prevData,
            ...changedValues
        }));
        setFormChange(true);
    };

    const handleRowSelect = (row) => {
        if (formChange) {
          setSelectRowData(row);
          setFormChange(false)
        } else {
          SelectRow(row);
          setSelected(row)
          setActiveTab(0);
        }
      };
    
      const SelectRow = async (row) => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
          const payload = {
            site: site,
            userId: userId,
            resourceType: row.records[0].resourceType,
            time: row.records[0].time,
            ...row  
          }
          
          const rowData = await retriveCycleTimeRow(site, payload);
          if (rowData.message) {
            message.error(rowData.message)
            form.resetFields();
          }
          else{
            setFormData(rowData);
            setSelected(rowData)
            setIsFormDisabled(false);
          }
        } catch (error) {
          console.error('Error fetching data fields:', error);
        }
      };

    return (
        <CycleTimeUseContext.Provider value={{ formData, setFormData, setFormChange, formChange, activeTab, setActiveTab, isFormDisabled, setIsFormDisabled, call, setCall }}>
            <div className={styles.container}>
                <div className={styles.dataFieldNav}>
                    <CommonAppBar
                        onSearchChange={() => { }}
                        allActivities={[]}
                        username={username}
                        site={null}
                        appTitle={t("Testing")}
                        onSiteChange={handleSiteChange}
                    />
                </div>

                <CycleForm
                    data={formData}
                    fields={fieldsFormData}
                    onValuesChange={handleValuesChange}
                />

                <CommonTable data={filteredData} onRowSelect={handleRowSelect}/>

                <Modal
                    title={t("instruction")}
                    open={instructionVisible}
                    onCancel={() => setInstructionVisible(false)}
                >
                    <div>
                        <p>• Select a resource from the list or enter a new one</p>
                        <p>• Fill in all required fields marked with red asterisks</p>
                        <p>• Use time picker to select operation time</p>
                        <p>• Click Save to store your entries</p>
                        <p>• Click Cancel to reset the form</p>
                        <p>• Cycle time = Total Time / Target Quantity</p>
                        <p>• Production time = Cycle Time * Target Quantity</p>
                    </div>
                </Modal>
            </div>
        </CycleTimeUseContext.Provider>
    );
};

export default CycleScreen;