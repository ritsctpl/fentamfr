import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Row, Col, Form, Select, Switch, DatePicker, Modal, Table, Drawer, DrawerProps, Space, message, InputNumber } from 'antd';
import styles from '@modules/logTool/styles/logTool.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';
import { fetchComponentList, fetchLogToolList, fetchShopOrderPod } from '@services/podServices';
import { parseCookies } from 'nookies';
import LogToolTable from './LogToolTable';
import LogToolForm from './LogToolForm';
import { GrChapterAdd } from 'react-icons/gr';
import { getComponentDetails, getInventeryData, getPcuData, saveAssembleComponent } from '@services/assemblyService';
import { IoIosArrowDown } from "react-icons/io";
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { DynamicBrowse } from '@components/BrowseComponent';

interface LogToolStatusProps {
    filterFormData: PodConfig;
    selectedRowData: any;
    call2: boolean;
}
const uiToolNo: any = {
    pagination: false,
    filtering: false,
    sorting: false,
    multiSelect: false,
    tableTitle: 'Select Tool No',
    okButtonVisible: true,
    cancelButtonVisible: true,
    selectEventCall: false,
    selectEventApi: 'api/rits/',
    tabledataApi: "toolnumber-service"
  };

const LogToolMain: React.FC<LogToolStatusProps> = ({ filterFormData, selectedRowData ,call2}) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [bomComponentList, setBomComponentList] = useState<any[]>([]);
    const [filterText, setFilterText] = useState('');
    const [originalBomComponentList, setOriginalBomComponentList] = useState<any[]>([]);
    const [selectedRowDatas, setSelectedRowDatas] = useState<any>(null);
    const [componentDetails, setComponentDetails] = useState<any>(null);
    const [dataType, setDataType] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState<DrawerProps['size']>('large');
    const [pcuVisible, setPcuVisible] = useState(false);
    const [invVisible, setInvVisible] = useState(false);
    const [pcuData, setPcuData] = useState<any[]>([]);
    const [invData, setInvData] = useState<any[]>([]);
    const [selectedValue, setSelectedValue] = useState<any>(null);
    const [inventoryId, setInventoryId] = useState<any>(null);
    const [dataFieldRowDatas, setDataFieldRowDatas] = useState<any>(null);
    const [toolNo, setToolNo] = useState<any>(null);
    const { t } = useTranslation();

    const [details, setDetails] = useState<any[]>([]);
    const [formattedDate, setFormattedDate] = useState<string>(''); // New state for formatted date

    const handleCancel = () => {
        setModalVisible(false);
        setPcuVisible(false);
        setInvVisible(false);
    };

    const fetchBomComponentList = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const shopOrderPod = { site, shopOrder: selectedRowData[0]?.shopOrder };
        const responseSO = await fetchShopOrderPod(shopOrderPod);
        setComponentDetails(responseSO);

      
        var attachmentList = [{
            "site": site,
            "pcu": selectedRowData[0]?.pcu,
            "operation": filterFormData.defaultOperation,
            "resource": filterFormData.defaultResource,
            "item":selectedRowData[0]?.item,
            "itemVersion":selectedRowData[0]?.item?.split('/')?.[1] || '',
            "shopOrder":selectedRowData[0]?.shopOrder,
            "routingVersion":selectedRowData[0]?.router?.split('/')?.[1] || '',
            "routing":selectedRowData[0]?.router
         }];
        let retrieveByAttachmentRequest = {
            "attachmentList": attachmentList
            }
        console.log(attachmentList, 'attachmentList');

        try {
            const response = await fetchLogToolList(site,retrieveByAttachmentRequest);
            console.log(response, 'bom component list');

            setBomComponentList(response);
            setOriginalBomComponentList(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBomComponentList();
    }, [filterFormData.defaultOperation]);

    const firstInputRef = useRef<any>(null);

    useEffect(() => {
        // Add a small delay to ensure the DOM is ready
        const timeoutId = setTimeout(() => {
          if (firstInputRef.current) {
            firstInputRef.current.focus({preventScroll: true});
          }
        }, 0);
    
        return () => clearTimeout(timeoutId); // Cleanup timeout
      }, [ call2]);

    const handleRowClick = async (record) => {
        console.log(record, 'response');

        setSelectedRowDatas(record);
        setSize('large');
        setOpen(true);
        form.setFieldsValue({
            component: record.component || '',
            remainingQty: record.assyQty || '',
            assembledQty: record.assembledQty || '',
        });

        const cookies = parseCookies();
        const site = cookies.site;
        const payload = {
            site: site,
            bom: componentDetails.plannedBom || '',
            revision: componentDetails.bomVersion || '',
            item: record.component || '',

        }
        console.log(payload, 'payload');
        const response = await getComponentDetails(site, payload);
        console.log(response, 'eeeee');

        setDataType(response);
    };

    const handleInputChange = (e) => {
        setFilterText(e.target.value);
    };

    const handleListClick = (item) => {
        setDetails(item.details || []);
        setDataFieldRowDatas(item);
        setModalVisible(true);
    };

    const handleScanClick = () => {
        const lowerCaseFilterText = filterText.toLowerCase();
        if (lowerCaseFilterText === '') {
            setBomComponentList(originalBomComponentList);
        } else {
            const filteredList = originalBomComponentList.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(lowerCaseFilterText)
                )
            );

            if (filteredList.length > 0) {
                const selectedItem = filteredList[0];
                setSelectedRowDatas(selectedItem);
                setOpen(true);
                form.setFieldsValue({
                    component: selectedItem.component || '',
                    remainingQty: selectedItem.assyQty || '',
                    assembledQty: selectedItem.assembledQty || '',
                });
                // handleRowClick(selectedItem);
            } else {
                setBomComponentList(originalBomComponentList);
            }
        }
    };

    const handleClearClick = () => {
        setFilterText('');
        setBomComponentList(originalBomComponentList);
    };

    const handleFormSubmit = async (values) => {
       
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        const payload = {
            "site": site,
            "userId": userId,
            "pcuBO": `PcuBO:RITS,${selectedRowData[0]?.pcu}`,
            "componentList": [
                {
                    "sequence": selectedRowDatas?.assySequence,
                    "component": values?.component,
                    "assembledQty": values?.assembledQty,
                    "operation": filterFormData?.defaultOperation,
                    "operationVersion": 'A',
                    "resourceBO": filterFormData?.defaultResource,
                    "assemblyDataList": values?.dataFields,
                }
            ],
        }
        console.log(payload, 'payloadssss');
        const response = await saveAssembleComponent(site, payload);
        console.log(response, 'payloadssss');

    };

    const handlePcuClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;

        const payload = {
            site: cookies.site,
            item: selectedRowDatas.component || '',
            version: selectedRowDatas.componentVersion || '',
        }

        try {
            const response = await getPcuData(site, payload);
            if (response && !response.errorCode) {
                const formattedData = response.inventoryList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setPcuData(formattedData);
            } else {
                setPcuData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setPcuVisible(true);
    };

    const handleInvClick = async () => {
        const cookies = parseCookies();
        const site = cookies.site;

        const payload = {
            site: cookies.site,
            item: selectedRowDatas?.component || '',
            version: selectedRowDatas?.componentVersion || '',
        }

        try {
            const response = await getInventeryData(site, payload);
            console.log(response, 'Inventory data');

            if (response && !response.errorCode) {
                const formattedData = response.inventoryList.map((item: any, index: number) => ({
                    id: index,
                    ...item,
                }));
                setInvData(formattedData);
            } else {
                setInvData([]);
            }
        } catch (error) {
            console.error('Error', error);
        }
        setInvVisible(true);
    }

    const handleInvSelect = (record) => {
        const newInventoryId = record.inventoryId;
        form.setFieldsValue({ INV: newInventoryId });
        setInvVisible(false);
    };

    const handlePcuSelect = (record) => {
        const newPcuId = record.inventoryId;
        form.setFieldsValue({ PCU: newPcuId });
        setPcuVisible(false);
    };


    const handleSelect = (record: any) => {
        if (dataFieldRowDatas) {
            form.setFieldsValue({ [dataFieldRowDatas.dataField]: record.labelValue });
        }
        setSelectedValue(record.labelValue);
        setModalVisible(false);
    };

    const handlePcuChange = (value: string) => {
        form.setFieldsValue({ PCU: value });
    }

    const handleInvChange = (e, fieldName) => {
        const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        console.log(newValue, 'new');
        const patterns: { [key: string]: RegExp } = {
            INV: /^[A-Z0-9_]*$/,
        };

        if (patterns[fieldName]?.test(newValue)) {
            form.setFieldsValue({ [fieldName]: newValue });
        }
    };

    const handleDateChange = (date: Dayjs | null, key: string) => {
        const formattedDateValue = date ? dayjs(date).format('DD-MM-YYYY') : '';
        setFormattedDate(formattedDateValue); // Save the formatted date in state
        // You can now use formattedDate as needed
    };

    const dataFieldData = dataType?.dataFieldList?.map((item, index) => ({
        key: index,
        name: item.dataField,
        input: (
            <Form.Item
                className={styles.formItems}
                name={item.dataField}
                rules={item.required ? [{ required: true, message: `${item.dataField} is required!` }] : []}
            >
                {item.dataType === 'List' && (item.dataField?.toUpperCase() === 'INV' || item.dataField?.toUpperCase() === 'INVENTORY') && (
                    <Form.Item name={item.dataField} className={styles.formItems}>
                        <Input
                            autoComplete='off'
                            value={inventoryId || ''}
                            suffix={
                                item.browseIcon ? (
                                    <GrChapterAdd style={{ cursor: 'pointer' }}
                                        onClick={handleInvClick}
                                    />
                                ) : (
                                    <IoIosArrowDown style={{ cursor: 'pointer' }}
                                        onClick={handleInvClick}
                                    />
                                )
                            }
                            onChange={(e) => {
                                handleInvChange(e, item.dataField);
                            }}
                        />
                    </Form.Item>
                )}

                {item.dataType === 'List' && item.dataField?.toUpperCase() === 'PCU' && (
                    <Form.Item name={item.dataField} className={styles.formItems}>
                        <Input
                            autoComplete='off'
                            suffix={
                                item.browseIcon ? (
                                    <GrChapterAdd style={{ cursor: 'pointer' }}
                                        onClick={handlePcuClick}
                                    />
                                ) : (
                                    <IoIosArrowDown style={{ cursor: 'pointer' }}
                                        onClick={handlePcuClick}
                                    />
                                )
                            }
                            onChange={(e) => handlePcuChange(e.target.value)}
                        />
                    </Form.Item>
                )}

                {item.dataType === 'List' && item.dataField !== 'PCU' && item.dataField !== 'INV' && (
                    <Form.Item name={item.dataField} className={styles.formItems}>
                        <Input
                            onClick={() => handleListClick(item)}
                            value={selectedValue || ''}
                            autoComplete='off'
                            suffix={
                                item.browseIcon ? (
                                    <GrChapterAdd style={{ cursor: 'pointer' }}
                                        onClick={() => handleListClick(item)}
                                    />
                                ) : (
                                    <IoIosArrowDown style={{ cursor: 'pointer' }}
                                        onClick={() => handleListClick(item)}
                                    />
                                )
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedValue(value);
                            }}
                        />
                    </Form.Item>
                )}

                {item.dataType === 'Text' && <Form.Item name={item.dataField} className={styles.formItems}><Input autoComplete='off' /></Form.Item>}
                {item.dataType === 'Textarea' && <Form.Item name={item.dataField} className={styles.formItems}><Input.TextArea autoComplete='off' /></Form.Item>}
                {item.dataType === 'CheckBox' && <Form.Item name={item.dataField} className={styles.formItems}><Switch /></Form.Item>}
                {item.dataType === 'DatePicker' && <Form.Item name={item.dataField} className={styles.formItems}><DatePicker format="DD-MM-YYYY"
                    onChange={(date) => handleDateChange(date, item.dataField)} /></Form.Item>}
                {item.dataType === 'Number' && <Form.Item name={item.dataField} className={styles.formItems}><InputNumber /></Form.Item>}
            </Form.Item>
        ),
    }));

    const handleClose = () => {
        setOpen(false);
        setFilterText('');
        setBomComponentList(originalBomComponentList);
        setSelectedRowDatas(null);
    };

    const getColumns = () => {
        if (details.length === 0) return [];
        const keys = Object.keys(details[0]);
        return keys.map(key => ({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            dataIndex: key,
            key: key,
        }));
    };
    const handleToolNoChange = (newValues: any[]) => {
        if(newValues.length ===0) {
            setToolNo("");
          }
          if (newValues.length > 0) {
            const newValue = newValues[0].toolNo;
            localStorage.setItem('revsion', newValues[0].revision);
            setToolNo(newValue);
           
          }
      };

    return (
        <div className={styles.container}>
            <div className={`${styles.firstChild} ${open ? styles.shifted : ''}`}>
                <div className={styles.subTitle}>
                    <p><span className={styles.subTitleText}>{t('batchNo')}: </span> {selectedRowData[0]?.pcu}</p>
                    <p><span className={styles.subTitleText}>{t('operation')}: </span> {filterFormData?.defaultOperation}</p>
                    <p><span className={styles.subTitleText}>{t('resource')}: </span> {filterFormData?.defaultResource}</p>
                    <p><span className={styles.subTitleText}>{t('itemBO')}: </span> {selectedRowData[0]?.item}</p>
                    <p><span className={styles.subTitleText}>{t('shopOrderBO')}: </span> {selectedRowData[0]?.shopOrder}</p>
                </div>

                {
                    open ? (
                        <Form layout="inline" className={styles.subTitle1} style={{overflow: 'auto'}}>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item
                                    label={t('Tool No')}
                                    className={styles.subTitleTextScan}
                                >
                                    <DynamicBrowse 
                                        uiConfig={uiToolNo} 
                                        initial={toolNo} 
                                        onSelectionChange={handleToolNoChange} 
                                        setOnChangeValue={()=>{}}
                                        selectedInput={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item label={t('Qty Log')} className={styles.subTitleTextScan}>
                                    <Input
                                        className={styles.subTitleInput}
                                        onChange={handleInputChange}
                                        value={filterText}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                                        ref={firstInputRef}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item>
                                    <Button type="primary" onClick={handleScanClick}>{t('Log Tool')}</Button>
                                    <Button type="primary" onClick={handleClearClick}>{t('clear')}</Button>
                                </Form.Item>
                            </Col>
                        </Form>
                    ) : (
                        <Form layout="inline" className={styles.subTitle1}>
                             <Col span={6}>
                                <Form.Item
                                    label={t('Tool No')}
                                    className={styles.subTitleTextScan}
                                >
                                    <DynamicBrowse 
                                        uiConfig={uiToolNo} 
                                        initial={toolNo} 
                                        onSelectionChange={handleToolNoChange} 
                                        setOnChangeValue={()=>{}}
                                        selectedInput={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item 
                                    label={t('qty')}
                                    className={styles.subTitleTextScan}
                                >
                                    <Input
                                        className={styles.subTitleInput}
                                        onChange={handleInputChange}
                                        value={filterText}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item 
                                    label={t('Available Qty')}
                                    className={styles.subTitleTextScan}
                                >
                                    <Input
                                        className={styles.subTitleInput}
                                        onChange={handleInputChange}
                                        value={filterText}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                                    />
                                </Form.Item>
                            </Col>
                           
                            <Col span={3}>
                                <Form.Item>
                                    <Button type="primary" onClick={handleScanClick} style={{ marginRight: '8px' }}>{t('Log Tool')}</Button>
                                    <Button type="primary" onClick={handleClearClick}>{t('clear')}</Button>
                                </Form.Item>
                            </Col>
                        </Form>
                    )
                }

                <LogToolTable dataSource={bomComponentList} onRowClick={handleRowClick} /><br />
            </div>
            {
                open && (
                    <div className={`${styles.secondChild} ${open ? styles.visible : ''}`}>
                        <LogToolForm
                            form={form}
                            initialValues={{
                                component: selectedRowDatas?.component || '',
                                remainingQty: selectedRowDatas?.assyQty || '',
                                assembledQty: selectedRowDatas?.assembledQty || '',
                            }}
                            dataType={dataType}
                            dataFieldData={dataFieldData}
                            onSubmit={handleFormSubmit}
                            onClose={handleClose}
                        />
                    </div>
                )
            }

            <Modal
                title="Select Value"
                open={modalVisible}
                onCancel={handleCancel}
                width={600}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleSelect(record),
                        style: {fontSize: '13.5px' }
                    })}
                    columns={getColumns()}
                    size="small"
                    dataSource={details}
                    rowKey={(record) => record.labelValue || record.id}
                    pagination={{ pageSize: 6 }}
                />
            </Modal>

            <Modal
                title="Select PCU"
                open={pcuVisible}
                onCancel={handleCancel}
                width={600}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    size="small"
                    onRow={(record) => ({
                        onDoubleClick: () => handlePcuSelect(record),
                        style: {fontSize: '13.5px' }
                    })}
                    columns={[
                        {
                            title: 'Inventory Id',
                            dataIndex: 'inventoryId',
                            key: 'inventoryId',
                        },
                        {
                            title: 'Quantity',
                            dataIndex: 'qty',
                            key: 'qty',
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                        },
                    ]}
                    dataSource={pcuData}
                    rowKey="labelValue"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
            <Modal
                title="Select Inventory"
                open={invVisible}
                onCancel={handleCancel}
                width={600}
                footer={null}
            >
                <Table
                    style={{ overflow: 'auto' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleInvSelect(record),
                    })}
                    columns={[
                        {
                            title: 'Inventory Id',
                            dataIndex: 'inventoryId',
                            key: 'inventoryId',
                        },
                        {
                            title: 'Quantity',
                            dataIndex: 'qty',
                            key: 'qty',
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                        },
                    ]}
                    dataSource={invData}
                    rowKey="labelValue"
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
        </div>
    );
};

export default LogToolMain;
