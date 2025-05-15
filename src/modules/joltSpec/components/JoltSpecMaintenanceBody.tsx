import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from '../styles/ActivityMaintenance.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { Form, Input, message, Button, Modal, Tooltip } from 'antd';
import CopyIcon from '@mui/icons-material/FileCopy'; // Import Copy icon
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Tabs, Tab, } from '@mui/material';
import dayjs from 'dayjs';
import { createSpec, deleteSpec, encodeSpec, updateSpec } from '@services/joltSpecService';
import { useTranslation } from 'react-i18next';
import { JoltSpecContext } from '../hooks/joltSpecContext';
import SpecForm from './SpecForm';
import { parseCookies } from 'nookies';

interface CustomData {
    customData: string;
    value: string;
}

interface ItemData {
    activityId?: string;
    description?: string;
    category?: string;
    status?: string;
    messageType?: string;
    customDataList?: CustomData[];
}



interface JoltSpecMaintenanceBodyProps {
    isAdding: boolean;
    selectedRowData: any | null; // Allow null
    onClose: () => void;
    setFullScreen: (boolean) => void;
    itemRowData: ItemData[];
    addClickCount: number;
    setAddClick: (boolean) => void;
    fullScreen: boolean;
    call: number;
    setCall: (number) => void;
}





const JoltSpecMaintenanceBody: React.FC<JoltSpecMaintenanceBodyProps> = ({
    isAdding, selectedRowData, onClose, call, setCall, setFullScreen, setAddClick, fullScreen, }) => {


    const { payloadData, setPayloadData, setShowAlert, oReq, setOreq, isModalDummyVisible, setIsModalDummyVisible, disabledFields,
        setDisabledFields } = useContext<any>(JoltSpecContext);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isCopyModalVisible, setIsCopyModalVisible] = useState<boolean>(false);
    // const [encodedXslt, setEncodedXslt] = useState<any>();
    // const [encodedJsonAta, setEncodedJsonAta] = useState<any>();
    const [form] = Form.useForm();

    let encodedXslt, encodedJsonAta;



    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        // console.log("table data on tab change: ", customData);
        setActiveTab(newValue);
        setAddClick(false);
        // debugger;
    };

    const handleOpenChange = () => {
        if (fullScreen == false)
            setFullScreen(true);
        else
            setFullScreen(false);
    }


    const handleClose = () => {
        onClose();
    };


    const handleSave = async (oEvent) => {
        let flagToSave = true, flagToEncode = true;
        let buttonLabel = oEvent.currentTarget.innerText;


        if (payloadData.specName == "" || payloadData.specName == null || payloadData.specName == undefined) {
            flagToEncode = false;
            message.error("Spec Name cannot be empty");
            return;
        }

        if (payloadData.type == "JOLT" && (payloadData.joltSpec == "" || payloadData.joltSpec == null || payloadData.joltSpec == undefined)) {
            flagToEncode = false;
            message.error("JOLT Spec cannot be empty");
            return;
        }

        if (payloadData.type == "XSLT" && (payloadData.xsltSpec == "" || payloadData.xsltSpec == null || payloadData.xsltSpec == undefined)) {
            flagToEncode = false;
            message.error("XSLT Spec cannot be empty");
            return;
        }


        if (payloadData.type == "JSONATA" && (payloadData.jsonataSpec == "" || payloadData.jsonataSpec == null || payloadData.jsonataSpec == undefined)) {
            flagToEncode = false;
            message.error("JSONATA Spec cannot be empty");
            return;
        }


        const oEncodeSpec = async () => {
            // setIsModalDummyVisible(true)
            let req;
            if (payloadData.type === "XSLT") {
                req = payloadData.xsltSpec;
            } else if (payloadData.type === "JSONATA") {
                req = payloadData.jsonataSpec;
            }

            req = JSON.stringify(req);
            try {
                req = JSON.parse(req);
            }
            catch (error) {
                console.log("Could not parse it");
            }

            // console.log("Encode req: ", req);
            // console.log("Type of req: ", typeof req);

            setOreq(req);
            try {
                const encodeResponse = await encodeSpec(req);
                // console.log("Encoded response: ", encodeResponse);

                if (payloadData.type === "XSLT") {
                    form.setFieldsValue({ encodeXsltSpec: encodeResponse });
                    setPayloadData((prev) => ({
                        ...prev,
                        encodeXsltSpec: encodeResponse
                    }));
                    // setEncodedXslt(encodeResponse);
                    encodedXslt = encodeResponse;
                }

                else if (payloadData.type === "JSONATA") {
                    form.setFieldsValue({ encodedJsonAtaSpec: encodeResponse });
                    setPayloadData((prev) => ({
                        ...prev,
                        encodedJsonAtaSpec: encodeResponse
                    }));
                    // setEncodedJsonAta(encodeResponse);
                    encodedJsonAta = encodeResponse;
                }


                flagToSave = !encodeResponse.errorCode;
            } catch (error) {
                console.error("Error during encoding: ", error);
                flagToSave = false;
            }
        };


        const oCreateSpec = async () => { // Rename the inner function to avoid recursion

            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                let updatedRequest;
                if (payloadData.type === "JOLT") {
                    let spec = payloadData.joltSpec;

                    spec = spec.toString();
                    // spec = JSON.stringify(spec);
                    try {
                        spec = JSON.parse(spec);
                        if (Array.isArray(spec))
                            flagToSave = true;
                        else {
                            flagToSave = false;
                            message.error("Jolt Spec has to be an array");
                            return;
                        }
                    } catch (error) {
                        message.error("Invalid Json");
                        console.log("Error parsing spec:", error);
                        return
                    }
                    setPayloadData((prevData) => ({
                        ...prevData,
                        joltSpec: spec,
                    }));
                    if (payloadData.type === 'JOLT') {
                        updatedRequest = {
                            specName: payloadData.specName,
                            joltSpec: spec,
                            description: payloadData.description,
                            type: payloadData.type,
                            site: site,
                        }
                    }
                    console.log("Updated request: ", updatedRequest)


                }

                if (payloadData.type === "XSLT") {
                    let spec = payloadData.xsltSpec;
                    spec = spec.toString();
                    // spec = JSON.stringify(spec);
                    // spec = JSON.parse(spec);
                    setPayloadData((prevData) => ({
                        ...prevData,
                        xsltSpec: spec,
                    }));
                    if (payloadData.type === 'XSLT') {
                        debugger
                        updatedRequest = {
                            specName: payloadData.specName,
                            xsltSpec: encodedXslt,
                            description: payloadData.description,
                            type: payloadData.type,
                            site: site,
                        }
                    }
                    console.log("Create request: ", updatedRequest)
                }

                if (payloadData.type === "JSONATA") {
                    let spec = payloadData.jsonataSpec;
                    spec = spec.toString();
                    // spec = JSON.stringify(spec);
                    // spec = JSON.parse(spec);
                    setPayloadData((prevData) => ({
                        ...prevData,
                        jsonataSpec: spec,
                    }));
                    if (payloadData.type === 'JSONATA') {
                        updatedRequest = {
                            specName: payloadData.specName,
                            jsonataSpec: encodedJsonAta,
                            description: payloadData.description,
                            type: payloadData.type,
                            site: site,
                        }
                    }
                    console.log("Create request: ", updatedRequest)
                }

                if (buttonLabel == "Create" || buttonLabel == "बनाएं"
                    || buttonLabel == "ರಚಿಸಿ" || buttonLabel == "உருவாக்க") {
                    const createResponse = await createSpec(updatedRequest);
                    console.log("Created response: ", createResponse);
                    if (createResponse) {
                        if (createResponse.errorCode) {
                            message.error(createResponse.message);
                        }
                        else {
                            setCall(call + 1);
                            setShowAlert(false);
                            message.success(createResponse?.message_details?.msg);
                            onClose();
                        }
                    }
                }

                else if (buttonLabel == "Save" || buttonLabel == "सहेजें" ||
                    buttonLabel == "ಉಳಿಸಿ" || buttonLabel == "சேமிக்க") {

                    if (flagToSave) {
                        const updateResponse = await updateSpec(updatedRequest);
                        console.log("Updated spec response: ", updateResponse);
                        if (updateResponse) {
                            if (updateResponse.errorCode) {
                                message.error(updateResponse?.message);
                            }
                            else {
                                onClose()
                                message.success(updateResponse?.message_details?.msg);
                                setCall(call + 1);
                                setShowAlert(false);
                                // let oSpec;
                                // oSpec = JSON.stringify(oSpec);

                                // if (updateResponse.response.type.toLowerCase() == "jolt") {
                                //     oSpec = updateResponse.response.joltSpec;
                                //     oSpec = JSON.stringify(oSpec);
                                //     // oSpec = JSON.parse(oSpec);
                                //     setPayloadData((prev) => ({
                                //         ...prev,
                                //         joltSpec: oSpec
                                //     }))
                                // }

                                // else if (updateResponse.response.type.toLowerCase() == "xslt") {
                                //     debugger
                                //     oSpec = updateResponse.response.xsltSpec;
                                //     setPayloadData((prev) => ({
                                //         ...prev,
                                //         xsltSpec: oSpec
                                //     }))
                                // }
                                // else if (updateResponse.response.type.toLowerCase() == "jsonata") {
                                //     debugger
                                //     oSpec = updateResponse.response.jsonataSpec;
                                //     setPayloadData((prev) => ({
                                //         ...prev,
                                //         jsonataSpec: oSpec
                                //     }))
                                // }
                               
                            }
                        }
                    }
                }

            } catch (error) {
                console.error('Error creating spec:', error);
            }
        };

        if (flagToEncode == true) {
            if (payloadData.type.toLowerCase() != "jolt")
                await oEncodeSpec();
        }
        if (flagToSave == true) {
           
                await oCreateSpec();
           
        }

    };




    const handleCancel = () => {
        // console.log("Cancel clicked");
        Modal.confirm({
            title: t('confirm'),
            content: t('closePageMsg'),
            okText: t('ok'),
            cancelText: t('cancel'),
            onOk: async () => {
                // Proceed with the API call if confirmed
                onClose();
            },
            onCancel() {
                //   console.log('Action canceled');
            },
        });
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setIsModalDummyVisible(false);
    };

    const handleConfirmDelete = () => {
        const oDeleteActivity = async () => { // Rename the inner function to avoid recursion
            try {
                const cookies = parseCookies();
                const site = cookies?.site;
                const specName = payloadData.specName;
                debugger
                const request = {site, specName}
                const response = await deleteSpec(request); // Assuming retrieveItem is an API call or a data fetch function
                if (!response.errorCode) {
                    console.log("Deleted spec: ", response);
                    message.success(response?.message_details?.msg);
                    setCall(call + 1);
                    setShowAlert(false);
                    onClose();
                }
                else {
                    console.log("Deleted spec: ", response);
                    message.success(response?.message);
                }
            } catch (error) {
                console.error('Error deleting spec:', error);
            }
        };

        oDeleteActivity();
        setIsModalVisible(false);
    };

    const handleOpenCopyModal = () => {
        // debugger
        setIsCopyModalVisible(true);
        // Optionally reset form fields
        form.resetFields();
        form.setFieldsValue({
            specName: selectedRowData.specName + "_COPY" || '',
            description: ''
        });
        // setPayloadData((prev) => ({
        //     ...prev,
        //     specName: selectedRowData.specName + "_COPY" || '',
        //     description: ""
        // }))
    };

    const handleCloseCopyModal = () => {
        setIsCopyModalVisible(false);
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { value } = e.target;
        let formattedValue = value;

        if (fieldName != 'description') {
            formattedValue = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        // console.log(`Field Change: ${fieldName}`, formattedValue); // Debugging line
        // Set field value
        form.setFieldsValue({ [fieldName]: formattedValue });
        // setPayloadData((prev) => ({
        //     ...prev,
        //     [fieldName]: formattedValue
        // }))
    };


    const handleConfirmCopy = () => {
        form
            .validateFields()
            .then(async (values) => {
                // Add your copy logic here with the form values
                // console.log('Activity copied:', values);

                let flagToSave = true, flagToEncode = true;
                console.log("Create request: ", payloadData);

                if (payloadData.specName == "" || payloadData.specName == null || payloadData.specName == undefined) {
                    flagToEncode = false;
                    message.error("Spec Name cannot be empty");
                    return;
                }

                if (payloadData.type == "Jolt" && (payloadData.joltSpec == "" || payloadData.joltSpec == null || payloadData.joltSpec == undefined)) {
                    flagToEncode = false;
                    message.error("Jolt Spec cannot be empty");
                    return;
                }

                if (payloadData.type == "Xslt" && (payloadData.xsltSpec == "" || payloadData.xsltSpec == null || payloadData.xsltSpec == undefined)) {
                    flagToEncode = false;
                    message.error("Xslt Spec cannot be empty");
                    return;
                }

                // if (payloadData.type == "Xslt" && (payloadData.encodeXsltSpec == "" || payloadData.encodeXsltSpec == null || payloadData.encodeXsltSpec == undefined)) {
                //     flagToEncode = false;
                //     message.error("Encoded Xslt Spec cannot be empty");
                //     return;
                // }

                if (payloadData.type == "JSONATA" && (payloadData.jsonataSpec == "" || payloadData.jsonataSpec == null || payloadData.jsonataSpec == undefined)) {
                    flagToEncode = false;
                    message.error("JSONATA Spec cannot be empty");
                    return;
                }

                // if (payloadData.type == "JsonAta" && (payloadData.encodedJsonAtaSpec == "" || payloadData.encodedJsonAtaSpec == null || payloadData.encodedJsonAtaSpec == undefined)) {
                //     flagToEncode = false;
                //     message.error("Encoded JsonAta Spec cannot be empty");
                //     return;
                // }

                const oEncodeSpec = async () => {
                    let spec, encodeResponse;
                    const type = payloadData.type;
                    if (type === "XSLT") {
                        spec = payloadData.xsltSpec;
                    }
                    else {
                        spec = payloadData.jsonataSpec;
                    }
                    try {
                        encodeResponse = await encodeSpec(spec);
                    }
                    catch (error) {
                        console.log("Error encoding: ", error);
                    }
                    // console.log("Encoded response: ", encodeResponse);
                    if (!encodeResponse.errorCode) {
                        if (type === "XSLT"){
                            form.setFieldsValue({ encodeXsltSpec: encodeResponse });
                            encodedXslt = encodeResponse;
                        }

                        else{
                            form.setFieldsValue({ encodedJsonAtaSpec: encodeResponse });
                            encodedJsonAta = encodeResponse;
                        }

                        flagToSave = true;
                    }
                    else {
                        flagToSave = false;
                    }
                }


                const oCopySpec = async () => { // Rename the inner function to avoid recursion
                    let updatedRequest, spec;
                    const cookies = parseCookies();
                    const site = cookies?.site;
                    try {
                        if (payloadData.type === "JOLT") {
                            spec = payloadData.joltSpec;

                            spec = spec.toString();
                            // spec = JSON.stringify(spec);
                            try {
                                spec = JSON.parse(spec);
                            } catch (error) {
                                console.log("Error parsing spec:", error);
                            }

                            setPayloadData((prevData) => ({
                                ...prevData,
                                joltSpec: spec,
                            }));
                        }
                        if (payloadData.type === 'JOLT') {
                            updatedRequest = {
                                specName: form.getFieldsValue().specName,
                                joltSpec: spec,
                                description: form.getFieldsValue().description,
                                type: payloadData.type,
                                site: site,
                            }
                        }

                        else if (payloadData.type === 'XSLT') {
                            updatedRequest = {
                                specName: form.getFieldsValue().specName,
                                xsltSpec: encodedXslt,
                                description: form.getFieldsValue().description,
                                type: payloadData.type,
                                site: site,
                            }
                        }

                        else if (payloadData.type === 'JSONATA') {
                            let jsonAtaSpec = payloadData.jsonataSpec;
                            try {
                                debugger
                                // jsonAtaSpec = JSON.stringify(jsonAtaSpec);
                                jsonAtaSpec = jsonAtaSpec.toString();
                                // console.log(JSON.parse(JSON.stringify(jsonAtaSpec)))
                                updatedRequest = {
                                    specName: form.getFieldsValue().specName,
                                    jsonataSpec: encodedJsonAta,
                                    description: form.getFieldsValue().description,
                                    type: payloadData.type,
                                    site: site,
                                }
                                // updatedRequest.jsonataSpec = JSON.parse(JSON.stringify(updatedRequest.jsonataSpec));
                            }
                            catch (error) {
                                console.log("Error parsing spec ", error);
                            }

                        }
                        console.log("Copy request: ", updatedRequest)


                        const copyResponse = await createSpec(updatedRequest);
                        console.log("Copy  response: ", copyResponse);
                        if (copyResponse.errorCode) {
                            message.error(copyResponse?.message);
                        }
                        else {
                            setCall(call + 1);
                            message.success(copyResponse?.message_details?.msg);
                            setShowAlert(false);
                            onClose();
                        }

                    } catch (error) {
                        console.error('Error copying spec:', error);
                    }
                };

                if (flagToEncode == true) {
                    if (payloadData.type != "JOLT")
                        await oEncodeSpec();
                }
                if (flagToSave == true) {
                    await oCopySpec();
                }

                setIsCopyModalVisible(false);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };


    const { t } = useTranslation();


    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (<div 
                   
                    style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 270px',marginLeft: '10%' }}
                > <SpecForm onFinish={function (values: any): void { }} /> </div>)

            default:
                return null;
        }
    };

    // console.log("Payload data from boy content: ", payloadData);
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.dataFieldBodyContents}>
                    <div className={isAdding ? styles.heading : styles.headings}>
                        <div className={styles.split}>
                            <div>
                                <p className={styles.headingtext}>
                                    {selectedRowData ? selectedRowData.specName : t('createSpec')}
                                </p>
                                {selectedRowData && (
                                    <>

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
                                                {payloadData?.lastModifiedDateTime
                                                    ? dayjs(payloadData?.lastModifiedDateTime).format('DD-MM-YYYY HH:mm:ss')
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
                        </Tabs>
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        {renderTabContent()}
                    </Box>
                </div>
            </div>
            <footer className={styles.footer} style={{marginTop: '-10%'}}>
                <div className={styles.floatingButtonContainer}
                 style={{ position: 'fixed', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}
                >
                    <Button type='primary'
                        onClick={handleSave}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {selectedRowData ? t("save") : t("create")}
                    </Button>
                    <Button
                        className={` ${styles.cancelButton}`}
                        onClick={handleCancel}
                        style={{ width: 'auto', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {t("cancel")}
                    </Button>
                </div>
            </footer>
            <Modal
                title={t("confirmDelete")}
                open={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okText={t("delete")}
                cancelText={t("cancel")}
                centered
            >
                <p>{t("deleteMessage")}: <strong>{selectedRowData?.specName}</strong>?</p>
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
                        activityId: selectedRowData?.specName || '',
                        description: ''
                    }}
                >
                    <Form.Item
                        label={t("specName")}
                        name="specName"
                        rules={[{ required: true, message: 'Please enter the specName' }]}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'specName')} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t("description")}
                    >
                        <Input placeholder="" onChange={(e) => handleFieldChange(e, 'description')} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={t("confirmDelete")}
                open={isModalDummyVisible}
                onCancel={handleCloseModal}
                cancelText={t("cancel")}
                centered
            >
                <p> {oReq} </p>
            </Modal>

        </div>



    );
};

export default JoltSpecMaintenanceBody;