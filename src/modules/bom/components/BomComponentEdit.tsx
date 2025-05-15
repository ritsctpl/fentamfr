import React, { useContext } from 'react';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { parseCookies } from 'nookies';
import { Form, message, Tooltip } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BomContext } from '@modules/bom/hooks/useContext';
import DynamicForm from '@modules/bom/components/DynamicForm';
import BomComponentCustom from '@modules/bom/components/BomComponentCustom';
import AlternateComponentTable from '@modules/bom/components/AlternativeComponent';
import { defaultBomComponent } from '@modules/bom/types/bomTypes';
import { UpdateBomComponent } from '@services/BomService';

interface BomBodyProps {
    openHalfScreen: boolean;
    setOpenHalfScreen: (val: boolean) => void;
}

const BomComponentEdit: React.FC<BomBodyProps> = ({ openHalfScreen, setOpenHalfScreen }) => {

    const { mainForm, setMainForm, sequence, setSequence, activeTab, setActiveTab, setFormChange } = useContext<any>(BomContext)
    const { componentForm, setComponentForm } = useContext<any>(BomContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleClose = () => {
        setOpenHalfScreen(false);
    };

    const fieldsToInclude = [
        'assySequence',
        'component',
        'componentVersion',
        'componentDescription',
        'componentType',
        'assyQty',
        'maxNc',
        'maxUsage',
        'assyOperation',
        'assemblyDataTypeBo',
        'storageLocationBo',
    ];

    const handleValuesChange = (changedValues: any) => {
        setComponentForm(prevData => ({
            ...prevData,
            ...changedValues,
            assySequence: sequence ? sequence : componentForm.assySequence
        }));
        setFormChange(true)
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <DynamicForm
                        data={componentForm}
                        fields={fieldsToInclude}
                        onValuesChange={handleValuesChange}
                    />
                )
            case 1:
                return (
                    <AlternateComponentTable />
                );
            case 2:
                return (
                    <BomComponentCustom />
                );
            default:
                return null;
        }
    };


    const handleSave = async () => {
        const errors: string[] = [];
        if (!componentForm.assySequence) {
            errors.push('Assembly Sequence');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!componentForm.component) {
            errors.push('Component');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!componentForm.componentVersion) {
            errors.push('Component Version');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }


        if (!componentForm.assyQty) {
            errors.push('Assembly Quantity');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (componentForm.assyQty < 0) {
            errors.push('Assembly Quantity must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (componentForm.maxNc < 0) {
            errors.push('Max NC must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (componentForm.maxUsage < 0) {
            errors.push('Max Usage must be a non-negative number');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (componentForm && componentForm.alternateComponentList.length > 0) {
            const values = componentForm.alternateComponentList.some(cert => !cert.alternateComponent || !cert.alternateComponentVersion);
            if (values) {
                errors.push('Alternative component is Required');
                message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
                return;
            }
        }
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        try {
            const newObjectIdStr = String(componentForm.assySequence);
            const componentIndex = mainForm.bomComponentList.findIndex(
                (component) => component.assySequence === newObjectIdStr
            );

            const updatedComponentForm = {
                ...componentForm,
                site: site,
                userId: userId,
            };

            if (componentIndex !== -1) {
                mainForm.bomComponentList[componentIndex] = updatedComponentForm;
            } else {
                mainForm.bomComponentList.push(updatedComponentForm);
            }
            const payload = {
                ...mainForm,
                site: site,
                userId: userId
            };
            console.log("request: ", {site, userId, ...payload})
            const response = await UpdateBomComponent(site, userId, payload);

            if (response.message) {
                message.error(response.message);
            } else {
                message.success(response.message_details.msg);
                setOpenHalfScreen(false);
                setComponentForm(defaultBomComponent);
                setActiveTab(0);
                setFormChange(false);
                setMainForm(response.response);
            }

        } catch (error) {
            console.error('Error updating BOM:', error);
        }
    };

    const handleCancel = () => {
        setOpenHalfScreen(false)
        setComponentForm(defaultBomComponent)
        setFormChange(false)
        setSequence('')
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={openHalfScreen ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {mainForm?.bom ? mainForm?.bom : t("createBomComponent")}
                                </p>
                            </div>
                            <div className={styles.actionButtons}>
                                <Tooltip title="Close">
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
                            <Tab label={t("alternateComponent")} />
                            <Tab label={t("customData")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer}>
                <div className={styles.floatingButtonContainer}>
                    <button
                        className={`${styles.floatingButton} ${styles.saveButton}`}
                        onClick={handleSave}
                    >
                        {componentForm.assySequence === '' ? t("update") : t("update")}
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
    );
};

export default BomComponentEdit;