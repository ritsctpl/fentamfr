import React, { useState, useEffect, useContext } from 'react';
import styles from '@modules/item/styles/ItemMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { parseCookies } from 'nookies';
import DynamicTable from '@modules/item/components/DynamicTable';
import { createItem, deleteItem, updateItem } from '@services/itemServices';
import { Form, Input, message, Button, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab } from '@mui/material';
import ItemMaintenanceForm from '@modules/item/components/ItemMaintenanceForm';
import CustomTable from '@modules/item/components/AlternateComponentTable';
import DragDropTable from '@modules/item/components/PrintDocuments';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ItemContext } from '@modules/item/hooks/itemContext';

interface AlternateComponent {
    sequence: number;
    alternateComponent: string;
    alternateComponentVersion: string;
    parentComponent: string;
    parentComponentVersion: string;
    validFrom: string;
    validTo: string;
}

interface CustomData {
    customData: string;
    value: string;
}

interface PrintDocument {
    document: string;
}

interface CustomDataList {
    customData: string;
}



interface ItemMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null;
    documentList: any[];
    onClose: () => void;
    setCall: (number) => void;
    setIsAdding: (boolean) => void;
    setFullScreen: (boolean) => void;
    setResetValueCall: () => void;
    setItemRowData: (any) => void;
    setCustomDataOnRowSelect: (any) => void;
    setFormModifiedData: (any) => void;
    resetValue: boolean;
    oCustomDataList: CustomDataList[];
    customDataForCreate: CustomDataList[];
    itemData: any;
    itemRowData: any;
    call: number;
    rowClickCall: number;
    resetValueCall: number;
    availableDocuments: any[];
    assignedDocuments: any[];
    customDataOnRowSelect: any[];
    availableDocumentForCreate: any[];
    addClick: boolean;
    setAddClick: (any) => void;
    addClickCount: number;
    fullScreen: boolean;
    payloadData: object;
    setPayloadData: () => void;
}

const ItemMaintenanceBody: React.FC<ItemMaintenanceBodyProps> = ({ call, setCall, resetValueCall,
    isAdding, selectedRowData, onClose, resetValue, customDataForCreate,
    itemData, customDataOnRowSelect, itemRowData, fullScreen,
    setFullScreen, setItemRowData, setCustomDataOnRowSelect, setFormModifiedData, addClick, setAddClick }) => {
    const { payloadData, setPayloadData, setShowAlert, username } = useContext(ItemContext);
    const [mainFormData, setMainFormData] = useState<Record<string, any>>(selectedRowData || {});
    const [alternateComponentTableData, setAlternateComponentTableData] = useState<AlternateComponent[]>(selectedRowData?.alternateComponentList || []);
    const [printDocumentFormData, setPrintDocumentFormData] = useState<PrintDocument[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [customData, setCustomData] = useState<CustomData[]>(selectedRowData?.customDataList || []);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [newData, setNewData] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<any[]>([]);
    const [alt, setAlt] = useState<any[]>([]);
    const [assignedPrintDocuments, setAssignedPrintDocuments] = useState<any[]>([]);

    useEffect(() => {
        if (itemRowData) {
            if (itemRowData.customDataList) {
                const updatedCustomDataList = itemRowData.customDataList.map((item, index) => ({
                    ...item,
                    id: index + 1
                }));
                setCustomData(customDataOnRowSelect);
            }

            if (itemRowData.alternateComponentList) {
                const updatedAlternateComponentList = itemRowData.alternateComponentList.map((item, index) => ({
                    ...item,
                    id: index + 1
                }));
                setAlternateComponentTableData(updatedAlternateComponentList);
            }
            setAssignedPrintDocuments(itemRowData.printDocumentFormData);
            setActiveTab(0);
        }

        else if (customDataForCreate) {
            setCustomData(customDataOnRowSelect);
            setAlternateComponentTableData([])
            setActiveTab(0);
        }
    }, [selectedRowData, customDataForCreate]);

    useEffect(() => {
        setAssignedPrintDocuments(itemRowData.printDocuments);
    }, [itemRowData]);

    useEffect(() => {
        if (addClick == true) {
            var resetFormValue: any = formValues;
            resetFormValue.item = "";
            resetFormValue.revision = "";
            setFormValues(resetFormValue);
        }
    }, [addClick]);

    const handleFormChange = (data: Record<string, any>) => {
        if (activeTab === 0) {
            setMainFormData(prevState => ({ ...prevState, ...data }));
        } else if (activeTab === 2) {
            setPrintDocumentFormData(data.document || []);
        }
    };

    const handleOpenChange = () => {
        debugger
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        if (customData) {
            if (customData.length)
                setCustomDataOnRowSelect(customData);
        }
        if (alt) {
            if (alt.length)
                setAlt(alt);
        }
        setAddClick(false);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = (oEvent) => {
        const cookies = parseCookies();
        if (printDocumentFormData)
            setAssignedPrintDocuments(printDocumentFormData);
        const updatedRowData: any = {
            ...formValues,
            site: cookies.site,
            alternateComponentList: payloadData.alternateComponentList,
            printDocuments: payloadData.printDocuments,

            // printDocuments: printDocumentFormData,
            // customDataList: customData, // Ensure this is correctly formatted
            customDataList: payloadData.customDataList, // Ensure this is correctly formatted

            // customDataList: customDataOnRowSelect,

            userId: username
        };

        if (updatedRowData.item == undefined || updatedRowData.item == null || updatedRowData.item == "") {
            message.error("Item cannot be empty");
            return;
        }
        if (updatedRowData.revision == undefined || updatedRowData.revision == null || updatedRowData.revision == "") {
            message.error("Revision cannot be empty");
            return;
        }
        if (updatedRowData.lotSize == undefined || updatedRowData.lotSize == null || updatedRowData.lotSize == "") {
            message.error("LotSize cannot be empty");
            return;
        }

        const isValidAlternateComponentList = updatedRowData.alternateComponentList.every((item, index) => {
            if (item.alternateComponent === null || item.alternateComponent === undefined || item.alternateComponent === '') {
                message.error(`Alternate Component cannot be empty`);
                return false;
            }

            if (item.alternateComponentVersion === null || item.alternateComponentVersion === undefined || item.alternateComponentVersion === '') {
                message.error(`Alternate Component Version cannot be empty`);
                return false;
            }

            if (item.parentMaterial === null || item.parentMaterial === undefined || item.parentMaterial === '') {
                message.error(`Parent Material cannot be empty `);
                return false;
            }

            if (item.parentMaterialVersion === null || item.parentMaterialVersion === undefined || item.parentMaterialVersion === '') {
                message.error(` Parent Material Version cannot be empty`);
                return false;
            }
            return true;
        });

        if (!isValidAlternateComponentList) {
            return;
        }



        const createMaterial = async () => {
            const cookies = parseCookies();
            const site = cookies.site;

            try {
                if (oEvent.currentTarget.innerText == "Create" || oEvent.currentTarget.innerText == "ರಚಿಸಿ" || oEvent.currentTarget.innerText == "बनाएं" || oEvent.currentTarget.innerText == "உருவாக்க") {
                    const createResponse = await createItem(updatedRowData);
                    if (createResponse.errorCode) {
                        message.error(createResponse.message);
                    }
                    else {
                        message.success(createResponse.message_details.msg);
                        setCall(call + 1);
                        setShowAlert(false);
                        onClose();
                    }
                }

                else if (oEvent.currentTarget.innerText == "Save" || oEvent.currentTarget.innerText == "ಉಳಿಸಿ" || oEvent.currentTarget.innerText == "सहेजें" || oEvent.currentTarget.innerText == "சேமிக்க") {
                    const updateResponse = await updateItem(updatedRowData);
                    if (updateResponse.errorCode) {
                        message.error(updateResponse.message);
                    }
                    else {
                        message.success(updateResponse.message_details.msg);
                        setItemRowData(updateResponse.response)
                        const formattedCustomData = updateResponse.response.customDataList.map((item, index) => ({
                            ...item,
                            id: index,
                            key: index
                        }));
                        setCustomDataOnRowSelect(formattedCustomData);
                        setCall(call + 1);
                        setShowAlert(false);
                    }
                }

            } catch (error) {
                console.error('Error fetching data fields:', error);
            }
        };
        createMaterial();
    };

    const handleCancel = () => {
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
            },
            onCancel() { },
        });
    };



    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleConfirmDelete = () => {
        const deleteMaterial = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            try {
                const item: string = selectedRowData.item;
                const revision: string | undefined = selectedRowData.revision;
                const userId = username;
                const oDeleteItem = await deleteItem(site, item, revision, userId);
                if (!oDeleteItem.errorCode) {
                    message.success(oDeleteItem.message_details.msg);
                    setCall(call + 1);
                    onClose();
                }
                else {
                    console.log("Deleted item: ", oDeleteItem);
                }
            } catch (error) {
                console.error('Error fetching data fields:', error);
            }
        };

        deleteMaterial();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            item: selectedRowData?.item + "_COPY" || '',
            revision: '',
            description: ''
        });
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName === 'item' || fieldName == "revision") {
            formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then((values) => {
                const formattedPrintDocuments = printDocumentFormData.map(value => ({ document: value.document }));
                const updatedRowData: any = {
                    ...selectedRowData,
                    ...mainFormData,
                    alternateComponentList: alternateComponentTableData,

                    printDocuments: payloadData.printDocuments,
                    customDataList: customData, // Ensure this is correctly formatted

                    // printDocuments: formattedPrintDocuments,
                    // customDataList: customData,

                    userId: username
                };
                updatedRowData.item = values.item;
                updatedRowData.revision = values.revision;
                updatedRowData.description = values.description;
                const createMaterial = async () => {
                    try {
                        const copyResponse = await createItem(updatedRowData);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse.message_details.msg);
                            onClose();
                        }

                    } catch (error) {
                        console.error('Error fetching data fields:', error);
                    }
                };

                createMaterial();
                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                // console.log('Validation Failed:', errorInfo);
            });
    };

    const handleFormValuesChange = (values) => {
        setFormValues(values);
        setFormModifiedData(values);
        setPayloadData((prevData) => ({
            ...prevData,
            ...values
        }));
    };

    const { t } = useTranslation();



    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (<div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 245px', }}>
                    <ItemMaintenanceForm rowData={selectedRowData}
                        resetValueCall={resetValueCall} onValuesChange={handleFormValuesChange}
                        setNewData={setNewData} resetValue={resetValue} setFormValues={setFormValues} onChange={handleFormChange}
                        formValues={formValues} itemRowData={itemRowData}
                        setFormModifiedData={setFormModifiedData} payloadData={undefined} setPayloadData={function (): void {
                            throw new Error('Function not implemented.');
                        }} />
                </div>)
            case 1:
                return (
                    <CustomTable
                        dataSource={payloadData.alternateComponentList}
                        setAlt={setAlt}
                        resetValueCall={resetValueCall}
                        resetValue={resetValue}
                        itemData={itemData}
                        itemRowData={itemRowData} alt={[]} selectionMode={'checkbox'} onDataChange={function (data: any[]): void {
                            throw new Error('Function not implemented.');
                        }} buttonVisibility={false} payloadData={undefined} setPayloadData={function (): void {
                            throw new Error('Function not implemented.');
                        }} />
                );
            case 2:
                return (
                    <DragDropTable resetValue={resetValue} />
                );
            case 3:
                return (
                    <DynamicTable
                        initialData={payloadData.customDataList}

                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.item : t('createItem')}
                                </p>
                                {selectedRowData && (
                                    <>
                                        <p className={styles.dateText}>
                                            {t('versions')}
                                            <span className={styles.fadedText}>{selectedRowData.revision}</span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('createdDate')}
                                            <span className={styles.fadedText}>
                                                {selectedRowData.createdDateTime
                                                    ? dayjs(selectedRowData.createdDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>
                                        <p className={styles.dateText}>
                                            {t('modifiedTime')}
                                            <span className={styles.fadedText}>
                                                {/* {dayjs(selectedRowData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')} */}
                                                {selectedRowData.modifiedDateTime
                                                    ? dayjs(selectedRowData.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                <Tooltip title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                                    <Button
                                        onClick={handleOpenChange}
                                        className={styles.actionButton}
                                    >
                                        {fullScreen ? <CloseFullscreenIcon sx={{ color: '#1874CE' }} /> : <OpenInFullIcon sx={{ color: '#1874CE' }} />}
                                    </Button>
                                </Tooltip>


                                {selectedRowData && (
                                    <>
                                        <Tooltip title="Copy">
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon sx={{ color: '#1874CE' }} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon sx={{ color: '#1874CE' }} />
                                            </Button>
                                        </Tooltip>
                                    </>
                                )}

                                <Tooltip title="Close">
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon sx={{ color: '#1874CE' }} />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Item Maintenance Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("alternateComponent")} />
                            <Tab label={t("printDocument")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            {/* <footer className={styles.footer} style={{ marginTop: '-1%', }}> */}
                <div className={styles.floatingButtonContainer}
                 style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        onClick={handleSave}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={`${styles.floatingButton} ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {t("cancel")}
                    </Button>
                </div>
            {/* </footer> */}
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.item}</strong>?</p>
            </Modal>
            <Modal
                title={t("confirmCopy")}
                open={isCopyModalVisible}
                onOk={handleConfirmCopy}
                onCancel={handleCloseCopyModal}
                okText={t("copy")}
                cancelText={t("cancel")}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        item: selectedRowData?.item || '',
                        revision: '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("item")}
                        name="item"
                        rules={[{ required: true, message: 'Please enter the item' }]}
                    >
                        <Input placeholder="Enter item" onChange={(e) => handleFieldChange(e, 'item')} />
                    </Form.Item>
                    <Form.Item
                        label={t("revision")}
                        name="revision"
                        rules={[{ required: true, message: 'Please enter the revision' }]}
                    >
                        <Input placeholder="Enter revision" onChange={(e) => handleFieldChange(e, 'revision')} />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="Enter description" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ItemMaintenanceBody;