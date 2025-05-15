import React, { useContext, useEffect, useState } from 'react';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { parseCookies } from 'nookies';
import { Form, message, Modal, Tooltip } from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import DynamicForm from '@modules/podMaintenances/components/DynamicForm';
import { RButton, defaultRButton } from '@modules/podMaintenances/types/podMaintenanceTypes';
import AlternateComponentTable from '@modules/podMaintenances/components/Activities';
import { UpdatePodMaintenance } from '@services/podMaintenanceService';

interface PodBodyProps {
    openHalfScreen: boolean;
    setOpenHalfScreen: (val: boolean) => void;
}

const PodComponentsEdit: React.FC<PodBodyProps> = ({ openHalfScreen, setOpenHalfScreen }) => {

    const { mainForm, setMainForm, buttonForm, setButtonForm, setFormChange, sequence, setSequence, setButtonActiveTab, buttonActiveTab, setButtonFormChange, buttonFormChange } = useContext<any>(PodMaintenanceContext)
    const { t } = useTranslation()
    const [form] = Form.useForm();

    console.log(buttonActiveTab,'buttonActiveTab');
    
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setButtonActiveTab(newValue);
    };

    useEffect(() => {
        setSequence(buttonForm?.sequence)
    }, [buttonForm]);


    const handleClose = () => {
        if(buttonFormChange){
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    setOpenHalfScreen(false);
                    setButtonFormChange(false);
                },
            });
        }
        else{
            setOpenHalfScreen(false);
            setButtonFormChange(false);
        }
    };

    const fieldsToInclude = [
        'sequence',
        'buttonType',
        'buttonId',
        'buttonLabel',
        'buttonSize',
        'imageIcon',
        'hotKey',
        'buttonLocation',
    ];

    const handleValuesChange = (changedValues: any) => {
        // If the sequence is being changed directly in the form, use that value
        if (changedValues.sequence) {
            setSequence(changedValues.sequence);
        }
        
        setButtonForm((prevData: RButton) => ({
            ...prevData,
            ...changedValues,
            sequence: changedValues.sequence || prevData.sequence || sequence
        }));
        
        setButtonFormChange(true);          
    };

    console.log(buttonForm, 'updatedButton');
    console.log(mainForm, 'updatedButtonmain');
    
    

    const renderTabContent = () => {
        switch (buttonActiveTab) {
            case 0:
                return (
                    <div style={{ height: 'calc(100vh - 260px)', overflow: 'auto' }}>
                        <DynamicForm
                            data={buttonForm}
                            fields={fieldsToInclude}
                            onValuesChange={handleValuesChange}
                        />
                        <div className={styles.podContainer}>
                            <div className={styles.topSection}>
                                {t("podSelection")}
                            </div>

                            {mainForm.panelLayout === '1' && (
                                <div className={styles.secondSection}>
                                    <div className={styles.numberColumn}>1</div>
                                </div>
                            )}

                            {mainForm.panelLayout === '2' && (
                                <>
                                    <div className={styles.secondSection}>
                                        <div className={styles.numberColumn}>1</div>
                                    </div>
                                    <div className={styles.bottomSection}>
                                        <div className={styles.numberColumn}>2</div>
                                    </div>
                                </>
                            )}

                            {mainForm.panelLayout === '3' && (
                                <>
                                    <div className={styles.secondSection}>
                                        <div className={styles.numberColumn}>1</div>
                                    </div>
                                    <div className={styles.bottomSection}>
                                        <div className={styles.numberColumn}>2</div>
                                        <div className={styles.numberColumn}>3</div>
                                    </div>
                                </>
                            )}

                            {mainForm.panelLayout === '4' && (
                                <>
                                    <div className={styles.secondSection}>
                                        <div className={styles.numberColumn}>1</div>
                                    </div>
                                    <div className={styles.bottomSection}>
                                        <div className={styles.numberColumn}>2</div>
                                        <div className={styles.numberColumn}>3</div>
                                        <div className={styles.numberColumn}>4</div>
                                    </div>
                                </>
                            )}

                            {mainForm.panelLayout === '5' && (
                                <>
                                    <div className={styles.secondSection}>
                                        <div className={styles.numberColumn}>1</div>
                                        <div className={styles.numberColumn}>2</div>
                                    </div>
                                    <div className={styles.bottomSection}>
                                        <div className={styles.numberColumn}>3</div>
                                        <div className={styles.numberColumn}>4</div>
                                        <div className={styles.numberColumn}>5</div>
                                    </div>
                                </>
                            )}

                            {mainForm.panelLayout === '6' && (
                                <>
                                    <div className={styles.secondSection}>
                                        <div className={styles.numberColumn}>1</div>
                                        <div className={styles.numberColumn}>2</div>
                                        <div className={styles.numberColumn}>3</div>
                                    </div>
                                    <div className={styles.bottomSection}>
                                        <div className={styles.numberColumn}>4</div>
                                        <div className={styles.numberColumn}>5</div>
                                        <div className={styles.numberColumn}>6</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            case 1:
                return (
                    <AlternateComponentTable />
                );
            default:
                return null;
        }
    };


    const handleSave = async () => {
        message.destroy();
        const errors: string[] = [];

        if (!buttonForm.buttonType) {
            errors.push('Button type');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!buttonForm.buttonId) {
            errors.push('Button Id');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!buttonForm.buttonLabel) {
            errors.push('Button Label');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (!buttonForm.sequence) {
            errors.push('Sequence');
            message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
            return;
        }

        if (buttonForm && buttonForm.activityList.length > 0) {
            const values = buttonForm.activityList.some(cert =>
                !cert.activity && !cert.pluginLocation && !cert.clearsPcu && !cert.fixed
            );
            if (values) {
                errors.push('Activity is Required');
                message.error(`Please fill in the following required fields: ${errors.join(', ')}.`);
                return;
            }
        }

        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id
        
        try {
            let updatedButtonList = [...mainForm.buttonList];
            
            // Always use the sequence from buttonForm directly to ensure we're editing the right row
            const newSequence = String(buttonForm.sequence);   
            
            // Check if this is a resequencing operation
            if (buttonForm.needsResequencing) {
                const targetSequence = buttonForm.targetSequence;
                const insertPosition = buttonForm.insertPosition;
                
                // Sort buttonList by sequence for proper resequencing
                updatedButtonList.sort((a, b) => +a.sequence - +b.sequence);
                
                if (insertPosition === 'before') {
                    // Create a copy of buttonForm without the resequencing metadata
                    const newButtonForm = {
                        ...buttonForm,
                        sequence: String(targetSequence),
                        needsResequencing: undefined,
                        insertPosition: undefined,
                        targetSequence: undefined
                    };
                    
                    // Shift all sequences >= targetSequence up by 10
                    updatedButtonList = updatedButtonList.map(component => {
                        if (+component.sequence >= +targetSequence) {
                            return { ...component, sequence: String(+component.sequence + 10) };
                        }
                        return component;
                    });
                    
                    // Add the new component at the target sequence
                    updatedButtonList.push(newButtonForm);
                } else if (insertPosition === 'after') {
                    // Create new sequence value (targetSequence + 10)
                    const newSequenceValue = +targetSequence + 10;
                    
                    // Create a copy of buttonForm without the resequencing metadata
                    const newButtonForm = {
                        ...buttonForm,
                        sequence: String(newSequenceValue),
                        needsResequencing: undefined,
                        insertPosition: undefined,
                        targetSequence: undefined
                    };
                    
                    // Shift all sequences > targetSequence up by 10
                    updatedButtonList = updatedButtonList.map(component => {
                        if (+component.sequence > +targetSequence) {
                            return { ...component, sequence: String(+component.sequence + 10) };
                        }
                        return component;
                    });
                    
                    // Add the new component after the target sequence
                    updatedButtonList.push(newButtonForm);
                }
                
                // Sort again after adding and resequencing
                updatedButtonList.sort((a, b) => +a.sequence - +b.sequence);
            } else {
                // Regular update/insert logic
                const componentIndex = updatedButtonList.findIndex((component) => component.sequence === newSequence);
                
                if (componentIndex !== -1) {
                    // Update existing component
                    updatedButtonList[componentIndex] = buttonForm;
                } else {
                    // Add new component and sort by sequence
                    updatedButtonList.push(buttonForm);
                    updatedButtonList.sort((a, b) => +a.sequence - +b.sequence);
                    
                    // Check if there are any sequence conflicts and resolve them
                    for (let i = 0; i < updatedButtonList.length - 1; i++) {
                        if (updatedButtonList[i].sequence === updatedButtonList[i + 1].sequence) {
                            // If there's a conflict, increment all subsequent sequences by 10
                            for (let j = i + 1; j < updatedButtonList.length; j++) {
                                updatedButtonList[j] = {
                                    ...updatedButtonList[j],
                                    sequence: String(+updatedButtonList[j].sequence + 10)
                                };
                            }
                        }
                    }
                }
            }
            
            const payload = {
                ...mainForm,
                buttonList: updatedButtonList,
                site: site,
                userId: userId
            };
            
            const response = await UpdatePodMaintenance(site, userId, payload);
            if (response.message) {
                message.error(response.message);
            } else {
                message.success(response.message_details.msg);
                setOpenHalfScreen(false);
                setButtonForm(defaultRButton);
                setButtonActiveTab(0);
                setFormChange(false);
                setMainForm(response.response);
                setButtonFormChange(false);
            }

        } catch (error) {
            console.error('Error updating BOM:', error);
        }
    };

    const handleCancel = () => {
        if(buttonFormChange){
            Modal.confirm({
                title: t('confirm'),
                content: t('closePageMsg'),
                okText: t('ok'),
                cancelText: t('cancel'),
                onOk: async () => {
                    setOpenHalfScreen(false)
                    setButtonForm(defaultRButton)
                    setButtonFormChange(false)
                    setSequence('')
                },
            });
        }
        else{
            setOpenHalfScreen(false)
            setButtonForm(defaultRButton)
            setButtonFormChange(false)
            setSequence('')
        }
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={openHalfScreen ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {mainForm?.podName ? mainForm?.podName : t("createPodButtons")}
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
                        <Tabs value={buttonActiveTab} onChange={handleTabChange} aria-label="Bom Tabs">
                            <Tab label={t("home")} />
                            <Tab label={t("activities")} />
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
                {
                    mainForm.type !== 'SubPod' && (
                        <footer className={styles.footer}>
                            {
                                openHalfScreen && (
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
                                )
                            }
                        </footer>
                    )
                }

            </div>
        </div>
    );
};

export default PodComponentsEdit;