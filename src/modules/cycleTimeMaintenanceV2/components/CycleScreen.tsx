'use client'
import CommonAppBar from '@components/CommonAppBar';
import { useAuth } from '@context/AuthContext';
import { decryptToken } from '@utils/encryption';
import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import styles from '@modules/cycleTimeMaintenance/styles/CycleTime.module.css';
import { useTranslation } from 'react-i18next';
import { Form, Modal, message } from 'antd';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import { CycleTimeRequest, defaultCycleTimeRequest } from '../types/cycleTimeTypes';
import CycleForm from './CycleForm';
import CommonTable from './CommonTable';
import { fetchCycleTimes, retriveCycleTimeRow, fetchAllResource, fetchAllWorkCenter, fetchAllMaterial } from '@services/cycleTimeService';
import { fetchAllResourceType } from '@services/workInstructionService';
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
            console.log(itemWithoutId, 'item without id')
            
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
        // Reset form state when site changes
        form.resetFields();
        setFormData(defaultCycleTimeRequest);
        setFormChange(false);
        setIsFormDisabled(true);
        setActiveTab(0);
    };

    const resetFormState = () => {
        // Reset form fields
        form.resetFields();
        
        // Reset main state
        setFormData(defaultCycleTimeRequest);
        setFormChange(false);
        setIsFormDisabled(true);
        setActiveTab(0);
        setSelected({});
        setSelectRowData(null);
        
        // Force re-render of components by triggering call state update
        // This ensures any cached data in child components is also refreshed
        setCall(prevCall => prevCall + 1);
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
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: () => {
                    resetFormState();
                    SelectRow(row);
                    setSelected(row);
                    setActiveTab(0);
                }
            });
        } else {
            SelectRow(row);
            setSelected(row);
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

    const handleSearch = async (searchPayload: any) => {
        console.log(searchPayload, 'search payload')
        const searchPayloads : any = {
            itemAndVersion: searchPayload?.itemAndVersion || searchPayload?.item,
            resource: searchPayload?.resource,
            resourceType: searchPayload?.resourceType,
            workCenter: searchPayload?.workCenter
        }
        
        try {
            // Fetch all data or use existing data
            const allData = await fetchCycleTimes(site);
            
            // If no search criteria is provided, show all data
            if (!searchPayloads.itemAndVersion && !searchPayloads.resource && 
                !searchPayloads.resourceType && !searchPayloads.workCenter) {
                const itemWithoutId = allData.map(({ itemId, material, materialVersion, ...rest }) => rest);
                setFilteredData(itemWithoutId);
                resetFormState(); // Reset form when showing all data
                return;
            }

            // Filter data based on search criteria
            const filteredItems = allData.filter(item => {
                // Match by item/version if provided
                if (searchPayloads.itemAndVersion && 
                    !item.itemAndVersion?.toLowerCase().includes(searchPayloads.itemAndVersion.toLowerCase())) {
                    return false;
                }
                
                // Check if any record matches the remaining criteria
                if (item.records && item.records.length > 0) {
                    return item.records.some(record => {
                        const resourceMatch = !searchPayloads.resource || 
                            (record.resource && record.resource.toLowerCase().includes(searchPayloads.resource.toLowerCase()));
                        
                        const resourceTypeMatch = !searchPayloads.resourceType || 
                            (record.resourceType && record.resourceType.toLowerCase().includes(searchPayloads.resourceType.toLowerCase()));
                        
                        const workCenterMatch = !searchPayloads.workCenter || 
                            (record.workCenter && record.workCenter.toLowerCase().includes(searchPayloads.workCenter.toLowerCase()));
                        
                        return resourceMatch && resourceTypeMatch && workCenterMatch;
                    });
                }
                
                return false;
            });
            
            // Format data for display
            const itemWithoutId = filteredItems.map(({ itemId, material, materialVersion, ...rest }) => rest);
            setFilteredData(itemWithoutId);
            
            // Reset form state if no results found
            if (itemWithoutId.length === 0) {
                resetFormState();
                message.info('No records found for the search criteria.');
            }

        } catch (error) {
            console.error('Error filtering data:', error);
            message.error('Failed to filter data');
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
                    onSearch={handleSearch}
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