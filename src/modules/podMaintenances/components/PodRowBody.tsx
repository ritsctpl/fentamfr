import React, { useState, useContext, useEffect } from 'react';
import styles from '@modules/podMaintenances/styles/podMaintenanceStyle.module.css';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Tabs, Tab, Button } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import DynamicForm from '@modules/podMaintenances/components/DynamicForm';
import CustomDataTable from '@modules/podMaintenances/components/CustomData';
import PodComponents from '@modules/podMaintenances/components/PodComponents';
import PodComponentsEdit from '@modules/podMaintenances/components/PodComponentEdit';
import PhaseListTable from './PhaseListTable';
import { createCopyPodMaintenance, deletePodMaintenance, UpdatePodMaintenance } from '@services/podMaintenanceService';
import { defaultCustomData, defaultListOption, defaultPodRequest, defaultPodSelection, defaultPrinters, defaultRButton, defaultSettings } from '../types/podMaintenanceTypes';
import LayoutTab from '@modules/podMaintenances/components/LayoutTab';
import SettingTab from './Settings';

interface CustomData {
    customData: string;
    value: string;
}

interface BomBodyProps {
    isAdding: boolean;
    fullScreen: boolean;
    call: number;
    onClose: () => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
    setCall: (val: number) => void;
    // retriveRow: any;
    SelectRow: any;
}

const PodRowBody: React.FC<BomBodyProps> = ({ setCall, call, fullScreen, setIsAdding, isAdding, onClose, setFullScreen, SelectRow }) => {
    const { mainForm, setMainForm, setFormChange, mainActiveTab, setMainActiveTab, subPodActiveTab, setSubPodActiveTab, retriveRow, setRetriveRow, formChange } = useContext<any>(PodMaintenanceContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
    const [openHalfScreen, setOpenHalfScreen] = useState<boolean>(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        if (retriveRow.type === 'SubPod') {
            console.log('call');

            setSubPodActiveTab(newValue);
        } else {
            console.log('call2');
            setMainActiveTab(newValue);
        }
    };

    const handleClose = () => {
        if(formChange){
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    onClose();
                    setOpenHalfScreen(false)
                    setMainActiveTab(0)
                    setSubPodActiveTab(0)
                    setMainForm(defaultPodRequest)
                    setFormChange(false)
                },
                onCancel() { },
            });
        }
        else{
            onClose();
            setOpenHalfScreen(false)
            setMainActiveTab(0)
            setSubPodActiveTab(0)
            setFormChange(false)
            setMainForm(defaultPodRequest)
        }
    };

    const handleSave = async () => {
        console.log('call');
        
        message.destroy();
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
            const row = {
                ...mainForm,
                site: site,
                userId: userId
            };
            const response = await UpdatePodMaintenance(site, userId, row);
            if (retriveRow?.type === 'SubPod') {
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setMainForm(response.response)
                    setRetriveRow(response.response)
                    setMainActiveTab(0)
                    setSubPodActiveTab(0)
                }
            }
            else {
                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg)
                    setMainForm(response.response)
                    setRetriveRow(response.response)
                    setMainActiveTab(0)
                    setSubPodActiveTab(0)
                }
            }

        } catch (error) {
            console.error('Validation failed:', error);
        }
    }

    const handleCancel = () => {
        if(formChange){
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
                setMainForm(defaultPodRequest)
                setFormChange(false)
                setOpenHalfScreen(false)
            },
                onCancel() { },
            });
        }
        else{
            onClose();
            setMainForm(defaultPodRequest)
            setFormChange(false)
            setOpenHalfScreen(false)
        }
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };


    const handleConfirmDelete = () => {
        const deleteBomMain = async () => {
            const cookies = parseCookies();
            const site = cookies.site;
            const userId = cookies.rl_user_id;

            try {
                const payload = {
                    ...mainForm,
                    site: site,
                    userId: userId
                };
                const response = await deletePodMaintenance(site, userId, payload);

                if (response.message) {
                    message.error(response.message)
                }
                else {
                    message.success(response.message_details.msg);
                    setCall(call + 1);
                    onClose();
                    setIsModalVisible(false);
                    setIsAdding(false)
                }
            } catch (error) {
                console.error('Error fetching data fields:', error);
            }
        };

        deleteBomMain();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        setIsCopyModalVisible(true);
        form.resetFields();
        form.setFieldsValue({
            podName: mainForm?.podName ? `${mainForm?.podName}_COPY` : '',
            description: mainForm?.description || '',
        });
    };

    const handleOpenUpdateModal = () => {
        setIsUpdateModalVisible(true);
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalVisible(false);
        setMainForm((prevData: any) => ({
            ...prevData,
            type: retriveRow?.type
        }))
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        if (fieldName === 'podName') {
            const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
            form.setFieldsValue({ [fieldName]: formattedValue });
        } else {
            form.setFieldsValue({ [fieldName]: value });
        }
    };

    const handleConfirmCopy = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id
        try {
            const values = await form.validateFields();
            const updatedRowData = {
                ...mainForm,
                podName: values?.podName,
                description: values?.description,
                site: site,
                userId: userId
            };

            const response = await createCopyPodMaintenance(site, userId, updatedRowData);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setCall(call + 1);
                onClose();
                handleCloseCopyModal();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleConfirmUpdate = async () => {

        const errors = [];
        if (!mainForm?.type) {
            errors.push('Type');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!mainForm?.podName) {
            errors.push('Pod Name');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!mainForm?.status) {
            errors.push('status');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!mainForm?.panelLayout) {
            errors.push('Panel Layout');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (mainForm.kafkaIntegration && !mainForm?.kafkaId) {
            errors.push('Kafka Id');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!mainForm?.defaultOperation) {
            errors.push('Default Operation');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!mainForm?.defaultResource) {
            errors.push('Default Resource');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (mainForm?.podCategory === 'Process' && !mainForm?.defaultPhaseId) {
            errors.push('Default Phase Id');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        let updatedRowData = {};
        if (retriveRow?.type === 'SubPod') {
            updatedRowData = {
                ...mainForm,
                site: site,
                userId: userId,
                buttonList: [],
                podSelection: [defaultPodSelection],
                printers: [defaultPrinters],
                settings: defaultSettings,
                layout: []
            };
        }
        else if (retriveRow?.type !== 'SubPod') {
            updatedRowData = {
                ...mainForm,
                site: site,
                userId: userId,
                tabConfiguration: {},
            };
        }
        try {

            const response = await UpdatePodMaintenance(site, userId, updatedRowData);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                SelectRow(response.response)
                setMainForm(response.response)
                setCall(call + 1);
                handleCloseUpdateModal();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleListChange = (changedValues: any) => {
        setMainForm(prevData => ({
            ...prevData,
            listOptions: [{
                ...prevData.listOptions[0],
                ...changedValues,
            }],
        }));
        setFormChange(true)
    };

    const handlePodSelectionChange = (changedValues: any) => {
        setMainForm(prevData => ({
            ...prevData,
            podSelection: [{
                ...prevData.podSelection[0],
                ...changedValues,
            }],
        }));
        setFormChange(true)
    };

    const handlePrintersChange = (changedValues: any) => {
        setMainForm(prevData => ({
            ...prevData,
            printers: [{
                ...prevData.printers[0],
                ...changedValues,
            }],
        }));
        setFormChange(true)
    };

    const fieldsListOptions = [
        'browseWorkList',
        'podWorkList',
        'assembleList',
        'dcCollectList',
        'operationList',
        'toolList',
        'workInstructionList',
        'dcEntryList',
        'subStepList',
    ];

    const fieldsListOptionsSubPod = [
        'assembleList',
        'dcCollectList',
        'operationList',
        'toolList',
        'workInstructionList',
        'dcEntryList',
        'subStepList',
    ];

    const fieldsPodSelectionOptions = [
        'mainInput',
        'mainInputHotKey',
        'pcuQueueButtonID',
        'pcuInWorkButtonID',
        'infoLine1',
        'infoLine2',
    ];

    const fieldsPrintersOptions = [
        'documentPrinter',
        'labelPrinter',
        'travelerPrinter',
    ]

    useEffect(() => {
        const currentTab = retriveRow?.type === 'SubPod' ? subPodActiveTab : mainActiveTab;
        if (currentTab === 0) {
            setOpenHalfScreen(false);
        } else {
            setOpenHalfScreen(false);
        }
    }, [mainActiveTab, subPodActiveTab]);

    const renderTabContent = () => {
        if (retriveRow?.type === 'SubPod') {
            switch (subPodActiveTab) {
                case 0:
                    return <PhaseListTable />;
                case 1:
                    return (
                        <div style={{ height: 'calc(100vh - 330px)', overflow: 'auto' }}>
                            <DynamicForm
                                data={mainForm.listOptions?.[0]}
                                fields={fieldsListOptionsSubPod}
                                onValuesChange={handleListChange}
                            />
                        </div>
                    );
                default:
                    return null;
            }
        }

        switch (mainActiveTab) {
            case 0:
                return (
                    <PodComponents call={call} setOpenHalfScreen={setOpenHalfScreen} openHalfScreen={openHalfScreen} />
                );
            case 1:
                return (
                    <div style={{ height: 'calc(100vh - 330px)', overflow: 'auto' }}>
                        <DynamicForm
                            data={mainForm.listOptions[0]}
                            fields={fieldsListOptions}
                            onValuesChange={handleListChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <DynamicForm
                        data={mainForm.podSelection[0]}
                        fields={fieldsPodSelectionOptions}
                        onValuesChange={handlePodSelectionChange}
                    />
                );
            case 3:
                return (
                    <DynamicForm
                        data={mainForm.printers[0]}
                        fields={fieldsPrintersOptions}
                        onValuesChange={handlePrintersChange}
                    />
                );
            case 4:
                return (
                    <div style={{ height: 'calc(100vh - 330px)', overflow: 'auto' }}>
                        <SettingTab />
                    </div>
                );
            case 5:
                return (
                    <div style={{ height: 'calc(100vh - 330px)', overflow: 'auto' }}>
                        <LayoutTab />
                    </div>
                );
            case 6:
                return <CustomDataTable />;
            default:
                return null;
        }
    };

    const fieldsToInclude = [
        'type',
        'podCategory',
        'description',
        'status',
        'panelLayout',
        'kafkaIntegration',
        'kafkaId',
        'resourceType',
        'defaultOperation',
        'defaultResource',
        'defaultPhaseId',
        'showResource',
        'showOperation',
        'showPhase',
        'phaseCanBeChanged',
        'operationCanBeChanged',
        'resourceCanBeChanged',
        'showQuantity',
        'documentName',
        'sessionTimeout',
        'refreshRate',
        'subPod',
    ];

    const handleValuesChange = (changedValues: any) => {
        setMainForm(prevData => ({
            ...prevData,
            ...changedValues
        }));
    };

    const renderTabs = () => {
        if (retriveRow?.type === 'SubPod') {
            return (
                <Tabs value={subPodActiveTab} onChange={handleTabChange} aria-label="Bom Tabs">
                    <Tab label={t("tab Configuration")} />
                    <Tab label={t("listOptions")} />
                </Tabs>
            );
        }
        return (
            <Tabs value={mainActiveTab} onChange={handleTabChange} aria-label="Bom Tabs">
                <Tab label={t("buttons")} />
                <Tab label={t("listOptions")} />
                <Tab label={t("podSelections")} />
                <Tab label={t("printers")} />
                <Tab label={t("settings")} />
                <Tab label={t("layout")} />
                <Tab label={t("customData")} />
            </Tabs>
        );
    };

    return (
        <div className={styles.dataFieldBody}>
            <div className={styles.dataFieldBodyContentsBottom}>
                <div className={`${styles.dataFieldBodyContents} ${openHalfScreen ? styles.shrink : ''}`}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {mainForm?.site ? mainForm?.podName : t("createPodMaintenance")}
                                </p>
                                {mainForm?.site && (
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <p className={styles.dateText}>
                                                {t('podType')} :
                                                <span className={styles.fadedText}>{retriveRow?.type || ''}</span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('description')} :
                                                <span className={styles.fadedText}>{retriveRow?.description || ''}</span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('status')} :
                                                <span className={styles.fadedText}>
                                                    <span className={styles.fadedText}>{retriveRow?.status || ''}</span>
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className={styles.dateText}>
                                                {t('createdOn')} :
                                                <span className={styles.fadedText}>
                                                    {dayjs(retriveRow?.createdDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('modifiedOn')} :
                                                {/*   {dayjs(mainForm?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') || ''} */}

                                                {retriveRow.modifiedDateTime ? dayjs(retriveRow.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                {
                                    !openHalfScreen && mainForm?.site &&
                                    <>
                                        <Tooltip title={t("copy")}>
                                            <Button onClick={handleOpenCopyModal} className={styles.actionButton}>
                                                <CopyIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={t("update")}>
                                            <Button onClick={handleOpenUpdateModal} className={styles.actionButton}>
                                                <ModeEditOutlineIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={t("delete")}>
                                            <Button onClick={handleOpenModal} className={styles.actionButton}>
                                                <DeleteIcon />
                                            </Button>
                                        </Tooltip>
                                    </>
                                }
                                <Tooltip title={t("close")}>
                                    <Button onClick={handleClose} className={styles.actionButton}>
                                        <CloseIcon />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    {renderTabs()}
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                    <footer className={styles.footer}>
                        <div className={styles.floatingButtonContainer}>
                            <button
                                className={`${styles.floatingButton} ${styles.saveButton}`}
                                onClick={handleSave}
                            >
                                {t("save")}
                            </button>
                            <button
                                className={`${styles.floatingButton} ${styles.cancelButton}`}
                                onClick={handleCancel}
                            >
                                {t("cancel")}
                            </button>
                        </div>
                    </footer>
                </div>
                <div className={`${styles.formContainer} ${openHalfScreen ? `${styles.show} ${fullScreen ? styles.showFullScreen : styles.show}` : ''}`}>
                    <PodComponentsEdit setOpenHalfScreen={setOpenHalfScreen} openHalfScreen={openHalfScreen} />
                </div>
            </div>

            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("confirmDelete")} <strong>{retriveRow?.podName}</strong>?</p>
            </Modal>

            <Modal
                title={t("updatePod")}
                open={isUpdateModalVisible}
                onOk={handleConfirmUpdate}
                onCancel={handleCloseUpdateModal}
                okText={t("update")}
                width={900}
                cancelText={t("cancel")}
                centered
            >
                <DynamicForm
                    data={mainForm}
                    fields={fieldsToInclude}
                    onValuesChange={handleValuesChange}
                    style={{ width: '100%', height: '70vh', overflow: 'scroll' }}
                />
            </Modal>

            <Modal
                title={t("copyPod")}
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
                >
                    <Form.Item
                        label={t("podName")}
                        name="podName"
                        rules={[{ required: true, message: 'Please enter the podName' }]}
                    >
                        <Input placeholder="Enter podName" onChange={(e) => handleFieldChange(e, 'podName')} />
                    </Form.Item>
                    <Form.Item
                        label={t("description")}
                        name="description"
                        rules={[{ required: true, message: 'Please enter the description' }]}
                    >
                        <Input placeholder="Enter description" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PodRowBody;