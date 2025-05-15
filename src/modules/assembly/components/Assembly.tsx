import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Row, Col, Form, Select, Switch, DatePicker, Modal, Table, Drawer, DrawerProps, Space, message, InputNumber } from 'antd';
import styles from '@modules/assembly/styles/Assembly.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';
import { fetchComponentList, fetchShopOrderPod } from '@services/podServices';
import { parseCookies } from 'nookies';
import AssemblyTable from './AssemblyTable';
import AssemblyForm from './AssemblyForm';
import { GrChapterAdd } from 'react-icons/gr';
import { getComponentDetails, getInventeryData, getPcuData, saveAssembleComponent } from '@services/assemblyService';
import { IoIosArrowDown } from "react-icons/io";
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import Ingredients from './Ingredients';

interface AssemblyStatusProps {
    filterFormData: PodConfig;
    selectedRowData: any;
    call2: boolean;
}

const AssemblyMain: React.FC<AssemblyStatusProps> = ({ filterFormData, selectedRowData ,call2}) => {

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
    const { t } = useTranslation();

    const [details, setDetails] = useState<any[]>([]);
    const [formattedDate, setFormattedDate] = useState<string>(''); // New state for formatted date


    const ingredients = {
       "ingredients": {
      "active": [
        {
          "sequence": "10",
          "ingredientId": "ING_LASUNA_BULBS",
          "ingreDescription": "Lasuna Bulbs",
          "quantity": "2.5",
          "uom": "KG",
          "materialDescription": "LASUNA (BULBS) (RCPT) DE IH",
          "storageLocation": "RM03",
          "tolerance": "2",
          "materialType": "Batch-controlled",
          "supplierId": "SUP_1001",
          "sourceLocation": "Factory_A",
          "qcParameters": [
            {
              "sequence": "10",
              "qcId": "QC_PURITY_1",
              "qcDescription": "abc",
              "parameter": "Purity",
              "actualValue": "5",
              "expectedValue": "5",
              "tolerance": "1"
            },
            {
              "sequence": "20",
              "qcId": "QC_PURITY_2",
              "qcDescription": "abc",
              "parameter": "Moisture Content",
              "actualValue": "5",
              "expectedValue": "5",
              "tolerance": "0.5"
            }
          ],
          "handlingInstructions": "Store in a cool, dry place",
          "storageInstructions": "Keep below 25°C",
          "unitCost": "10.00",
          "currency": "USD",
          "totalCost": "1500.00",
          "wasteQuantity": "0.08333333333333333",
          "wasteUoM": "KG",
          "byProduct": {
            "sequence": "10",
            "byProductId": "BYPROD_001",
            "description": "abc",
            "uom": "KG",
            "byProductQuantity": "0.03333333333333333"
          },
          "hazardous": false,
          "alternateIngredients": [
            {
              "sequence": "10",
              "ingredientId": "ALT_LASUNA_POWDER",
              "ingreDescription": "Lasuna Powder",
              "quantity": 2.3333333333333335,
              "uom": "KG",
              "tolerance": "2",
              "materialDescription": "ALT_LASUNA_POWDER",
              "storageLocation": "RM03",
              "materialType": "Batch-controlled",
              "batchNumber": "BATCH_002",
              "expiryDate": {
                "$date": "2025-11-29T18:30:00.000Z"
              },
              "manufactureDate": {
                "$date": "2023-01-19T18:30:00.000Z"
              },
              "qcParameters": [
                {
                  "sequence": "10",
                  "qcId": "QC_PURITY_3",
                  "qcDescription": "abc",
                  "parameter": "Purity",
                  "actualValue": "5",
                  "expectedValue": "5",
                  "tolerance": "1"
                }
              ],
              "unitCost": "9.50",
              "totalCost": "1330.00"
            }
          ]
        },
        {
          "sequence": "20",
          "ingredientId": "Flour",
          "ingreDescription": "High-quality wheat flour.",
          "quantity": "500",
          "uom": "kg",
          "materialDescription": "Fine wheat flour used for baking.",
          "storageLocation": "Warehouse A",
          "tolerance": "2",
          "materialType": "Raw Material",
          "supplierId": "SUP001",
          "sourceLocation": "Supplier Warehouse",
          "qcParameters": [
            {
              "sequence": "10",
              "qcId": "Moisture Content",
              "qcDescription": "Check moisture content to avoid clumping.",
              "parameter": "Moisture",
              "actualValue": "12",
              "expectedValue": "13",
              "monitoringFrequency": "Each batch",
              "toolsRequired": [
                "Moisture Analyzer"
              ],
              "actionsOnFailure": "Reject batch",
              "tolerance": "1",
              "min": 10,
              "max": 13
            }
          ],
          "handlingInstructions": "Keep in a dry and cool place.",
          "storageInstructions": "Store in sealed containers away from direct sunlight.",
          "unitCost": "0.50",
          "currency": "USD",
          "totalCost": "250.00",
          "wasteQuantity": "2",
          "wasteUoM": "kg",
          "batchNumber": "BATCH202401",
          "byProduct": {
            "sequence": "10",
            "byProductId": "Bran",
            "description": "Leftover bran from flour production.",
            "expectedQuantity": "50",
            "uom": "kg",
            "handlingProcedure": "Pack and store in dry containers.",
            "byProductQuantity": "48",
            "reusable": "Yes",
            "disposalCost": "5.00",
            "currency": "USD",
            "quantityProduced": "48"
          },
          "hazardous": false,
          "alternateIngredients": [
            {
              "sequence": "10",
              "ingredientId": "Rice Flour",
              "ingreDescription": "Alternative flour made from rice.",
              "quantity": 500,
              "uom": "kg"
            }
          ],
          "expiryDate": {
            "$date": "2024-12-30T18:30:00.000Z"
          },
          "manufactureDate": {
            "$date": "2023-12-31T18:30:00.000Z"
          }
        }
      ],
      "inactive": [
        {
          "sequence": "1",
          "ingredientId": "ING_CELLULOSE_MICROCRYSTALLINE",
          "ingreDescription": "Cellulose Microcrystalline",
          "quantity": "2.0569333333333333",
          "uom": "KG",
          "materialDescription": "CELLULOSE MICROCRYSTALLINE PH.EUR",
          "storageLocation": "RM03",
          "tolerance": "2",
          "materialType": "Batch-controlled",
          "qcParameters": [
            {
              "sequence": "10",
              "qcId": "QC_PURITY_4",
              "qcDescription": "abc",
              "parameter": "Moisture Content",
              "actualValue": "5",
              "expectedValue": "5",
              "tolerance": "0.5"
            }
          ],
          "handlingInstructions": "Handle with care to avoid contamination",
          "unitCost": "12.00",
          "totalCost": "1480.99",
          "wasteQuantity": "0.05",
          "wasteUoM": "KG",
          "batchNumber": "BATCH_003",
          "hazardous": false,
          "alternateIngredients": [],
          "expiryDate": {
            "$date": "2024-12-14T18:30:00.000Z"
          },
          "manufactureDate": {
            "$date": "2022-11-29T18:30:00.000Z"
          }
        },
        {
          "sequence": "1",
          "ingredientId": "ING_PREGELATINISED_STARCH",
          "ingreDescription": "Pregelatinised Starch",
          "quantity": "0.502",
          "uom": "KG",
          "materialDescription": "PREGELATINISED STARCH [UNIGEL 270] BP",
          "storageLocation": "RM03",
          "tolerance": "2",
          "materialType": "Batch-controlled",
          "qcParameters": [
            {
              "sequence": "10",
              "qcId": "QC_PURITY_5",
              "qcDescription": "abc",
              "parameter": "Moisture Content",
              "actualValue": "5",
              "expectedValue": "5",
              "tolerance": "0.5"
            }
          ],
          "handlingInstructions": "Avoid exposure to moisture",
          "unitCost": "8.50",
          "totalCost": "255.00",
          "wasteQuantity": "0.008333333333333333",
          "wasteUoM": "KG",
          "hazardous": false,
          "alternateIngredients": []
        },
        {
          "sequence": "1",
          "ingredientId": "ING_SILICA_COLLOIDAL",
          "ingreDescription": "Silica Colloidal Anhydrous",
          "quantity": "0.06",
          "uom": "KG",
          "materialDescription": "SILICA COLLOIDAL ANHYDROUS PH.EUR + IH",
          "storageLocation": "RM03",
          "tolerance": "2",
          "materialType": "Batch-controlled",
          "qcParameters": [
            {
              "sequence": "10",
              "qcId": "QC_PURITY_6",
              "qcDescription": "abc",
              "parameter": "Moisture Content",
              "actualValue": "5",
              "expectedValue": "5",
              "tolerance": "0.5"
            }
          ],
          "handlingInstructions": "Store in dry conditions, away from direct sunlight",
          "unitCost": "15.00",
          "totalCost": "54.00",
          "wasteQuantity": "0.003333333333333334",
          "wasteUoM": "KG",
          "hazardous": false,
          "alternateIngredients": []
        }
      ]
    },
    }   

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

        const params = {
            site,
            bom: responseSO?.plannedBom || '',
            revision: responseSO?.bomVersion || '',
            operation: filterFormData?.defaultOperation || '',
            pcuBO: `PcuBO:RITS,${selectedRowData[0]?.pcu || ''}`
        };

        // console.log(params, 'params');

        try {
            const response = await fetchComponentList(params);
            // console.log(response, 'bom component list');

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
    }, [filterFormData?.defaultOperation]);

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
            bom: componentDetails?.plannedBom || '',
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
        setDetails(item?.details || []);
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
            "pcuBO": `PcuBO:RITS,${selectedRowData[0]?.pcu || ''}`,
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
            item: selectedRowDatas?.component || '',
            version: selectedRowDatas?.componentVersion || '',
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

    return (
        <div className={styles.container}>
            <div className={`${styles.firstChild} ${open ? styles.shifted : ''}`}>

                {/* {
                    open ?
                     (
                        <Row className={styles.subTitle1}>
                            <Col span={14} className={styles.subTitle1}>
                                <p className={styles.subTitleTextScan}>{t('componentToScan')}:</p>
                                <Input
                                    className={styles.subTitleInput}
                                    onChange={handleInputChange}
                                    value={filterText}
                                    onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                                    ref={firstInputRef}
                                />
                            </Col>
                            <Col span={8} className={styles.subTitle1}>
                                <Button type="primary" onClick={handleScanClick}>{t('scan')}</Button>
                                <Button type="primary" onClick={handleClearClick}>{t('clear')}</Button>
                            </Col>
                        </Row>
                    ) : (
                        <Row className={styles.subTitle1}>
                            <Col span={8} className={styles.subTitle1}>
                                <p className={styles.subTitleTextScan}>{t('componentToScan')}:</p>
                                <Input
                                    className={styles.subTitleInput}
                                    onChange={handleInputChange}
                                    value={filterText}
                                    onKeyDown={(e) => e.key === 'Enter' && handleScanClick()}
                                    ref={firstInputRef}
                                />
                            </Col>
                            <Col span={8} className={styles.subTitle1}>
                                <Button type="primary" onClick={handleScanClick}>{t('scan')}</Button>
                                <Button type="primary" onClick={handleClearClick}>{t('clear')}</Button>
                            </Col>
                        </Row>
                    )
                } */}

                 <div className={styles.subTitle}>
                    <p><span className={styles.subTitleText}>{t('batchNo')}: </span> {selectedRowData[0]?.pcu}</p>
                    <p><span className={styles.subTitleText}>{t('operation')}: </span> {filterFormData?.defaultOperation}</p>
                    <p><span className={styles.subTitleText}>{t('resource')}: </span> {filterFormData?.defaultResource}</p>
                    <p><span className={styles.subTitleText}>{t('qty')}: </span> {selectedRowData[0]?.qty}</p>
                    <p><span className={styles.subTitleText}>{t('order')}: </span> {selectedRowData[0]?.shopOrder}</p>
                </div>

                {/* <AssemblyTable dataSource={bomComponentList} onRowClick={handleRowClick} /><br /> */}

                {/* <div style={{maxHeight: 'calc(100vh - 150px)', }}> */}
                    <Ingredients ingredients={ingredients} />
                {/* </div> */}

            </div>
            {
                open && (
                    <div className={`${styles.secondChild} ${open ? styles.visible : ''}`}>
                        <AssemblyForm
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
                    bordered={true}
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

export default AssemblyMain;
