import React, { useState, useContext, useEffect } from 'react';
import styles from '@modules/bom/styles/BomComponentStyle.module.css';
import { parseCookies } from 'nookies';
import { Form, Input, message, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Tabs, Tab, Button } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { BomContext } from '@modules/bom/hooks/useContext';
import BomComponents from '@modules/bom/components/BomComponents';
import { UpdateBom, createCopyBom, deleteBom } from '@services/BomService';
import DynamicForm from '@modules/bom/components/DynamicForm';
import BomComponentEdit from '@modules/bom/components/BomComponentEdit';
import BomCustom from '@modules/bom/components/BomCustom';

interface BomBodyProps {
    isAdding: boolean;
    fullScreen: boolean;
    call: number;
    onClose: () => void;
    setIsAdding: (val: boolean) => void;
    setFullScreen: (val: boolean) => void;
    setCall: (val: number) => void;
    retriveRow: any;
}

const BomRowBody: React.FC<BomBodyProps> = ({ setCall, call, fullScreen, setIsAdding, isAdding, onClose, setFullScreen, retriveRow }) => {

    const { mainForm, setMainForm } = useContext<any>(BomContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
    const [openHalfScreen, setOpenHalfScreen] = useState<boolean>(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
                setOpenHalfScreen(false)
            },
            onCancel() {},
        });
    };

    const handleSave = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
            const row = {
                ...mainForm,
                site: site,
                userId: userId
            };

            const response = await UpdateBom(site, userId, row);

            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setActiveTab(0)
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }
    
    const handleCancel = () => {
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                onClose();
            },
            onCancel() {},
        });
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
                const response = await deleteBom(site, userId, payload);

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
            bom: mainForm?.bom ? `${mainForm?.bom}_COPY` : '',
            revision: mainForm?.revision,
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
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        form.setFieldsValue({ [fieldName]: formattedValue });
    };

    const handleConfirmCopy = async () => {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
            const values = await form.validateFields();
            const updatedRowData = {
                ...mainForm,
                bom: values?.bom,
                revision: values?.revision,
                description: values?.description,
                site: site,
                userId: userId
            };

            const response = await createCopyBom(site, userId, updatedRowData);

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
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
        try {
            const values = mainForm;
            const updatedRowData = {
                ...mainForm,
                bomType: values?.bomType,
                status: values?.status,
                description: values?.description,
                designCost: values?.designCost,
                currentVersion: values?.currentVersion,
                bomTemplate: values?.bomTemplate,
                site: site,
                userId: userId
            };
            const response = await UpdateBom(site, userId, updatedRowData);
            if (response.message) {
                message.error(response.message)
            }
            else {
                message.success(response.message_details.msg)
                setCall(call + 1);
                handleCloseUpdateModal();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    useEffect(() => {
        if(activeTab === 0){
          setOpenHalfScreen(false)
        }
        else{
          setOpenHalfScreen(false)
        }
      }, [activeTab])

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <BomComponents call={call} setOpenHalfScreen={setOpenHalfScreen} openHalfScreen={openHalfScreen} />
                )
            case 1:
                return (
                    <BomCustom />
                );
            default:
                return null;
        }
    };

    const fieldsToInclude = [
        'description', 'bomType', 'status', 'designCost', 'validFrom', 'validTo', 'currentVersion', 'bomTemplate'
    ];

    const handleValuesChange = (changedValues: any) => {
        setMainForm(prevData => ({
            ...prevData,
            ...changedValues
        }));
    };

    return (
        <div className={styles.dataFieldBody}>
            <div className={styles.dataFieldBodyContentsBottom}>
                <div className={`${styles.dataFieldBodyContents} ${openHalfScreen ? styles.shrink : ''}`}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {mainForm?.createdDateTime ? mainForm?.bom : t("createUserGroupMaintenance")}
                                </p>
                                {mainForm?.createdDateTime && (
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <p className={styles.dateText}>
                                                {t('bomType')} :
                                                <span className={styles.fadedText}>{retriveRow?.bomType || ''}</span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('validFrom')} :
                                                <span className={styles.fadedText}>
                                                    {retriveRow?.validFrom || ''}
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('validTo')} :
                                                <span className={styles.fadedText}>
                                                {retriveRow?.validTo || ''}
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('description')} :
                                                <span className={styles.fadedText}>{retriveRow?.description || ''}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className={styles.dateText}>
                                                {t('currentVersion')} :
                                                <span className={styles.fadedText}>
                                                    {retriveRow?.currentVersion ? retriveRow.currentVersion.toString() : 'false'}
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('status')} :
                                                <span className={styles.fadedText}>
                                                    <span className={styles.fadedText}>{retriveRow?.status || ''}</span>
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('createdOn')} :
                                                <span className={styles.fadedText}>
                                                    {dayjs(retriveRow?.createdDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                                                </span>
                                            </p>
                                            <p className={styles.dateText}>
                                                {t('modifiedOn')} :
                                                {dayjs(retriveRow?.modifiedDateTime).format('DD-MM-YYYY HH:mm:ss') || ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actionButtons}>
                                {
                                    !openHalfScreen && retriveRow?.createdDateTime &&
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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Bom Tabs">
                            <Tab label={t("main")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
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
                    <BomComponentEdit setOpenHalfScreen={setOpenHalfScreen} openHalfScreen={openHalfScreen} />
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
                <p>{t("confirmDelete")} <strong>{mainForm?.bom}</strong>?</p>
            </Modal>

            <Modal
                title={t("updateBom")}
                open={isUpdateModalVisible}
                onOk={handleConfirmUpdate}
                onCancel={handleCloseUpdateModal}
                okText={t("update")}
                cancelText={t("cancel")}
                centered
            >
                <DynamicForm
                    data={mainForm}
                    fields={fieldsToInclude}
                    onValuesChange={handleValuesChange}
                />
            </Modal>

            <Modal
                title={t("copyBom")}
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
                        label={t("bom")}
                        name="bom"
                        rules={[{ required: true, message: 'Please enter the Bom' }]}
                    >
                        <Input placeholder="Enter Bom" onChange={(e) => handleFieldChange(e, 'bom')} />
                    </Form.Item>
                    <Form.Item
                        label={t("revision")}
                        name="revision"
                        rules={[{ required: true, message: 'Please enter the revision' }]}
                    >
                        <Input placeholder="Enter revision" onChange={(e) => handleFieldChange(e, 'revision')} />
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

export default BomRowBody;