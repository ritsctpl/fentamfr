import React, { useEffect, useState } from 'react';
import { message, Modal, Table } from 'antd';
import styles from '@modules/wiPlugin/styles/WiPlugin.module.css';
import { PodConfig } from '@modules/podApp/types/userTypes';

import { parseCookies } from 'nookies';
import { productionlog, retrieveOperationVersion, retrievePOD, retrieveWI, retrieveWIList, } from '@services/wiPluginService';
import { useTranslation } from 'react-i18next';

interface WIPluginProps {
    filterFormData: PodConfig;
    selectedRowData: any;
    call2: number;
    setCall2: (value: number) => void;
}


const WIMain: React.FC<WIPluginProps> = ({ filterFormData, selectedRowData, call2 }) => {
    // Combine related state declarations
    const [modalVisible, setModalVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [wiList, setWiList] = useState<any>();
    const { t } = useTranslation();

    // Use optional chaining for better readability
    const shopOrder = selectedRowData?.[0]?.shopOrder;
    const pcu = selectedRowData?.[0]?.pcu;
    const [userName, setUserName] = useState<any>();
    const [oWITableColumns, setOWITableColumns] = useState<any>();
    const [activeRowKeys, setActiveRowKeys] = useState<any>([]); // Add state to manage selected row keys

    const [modalText, setModalText] = useState<string | null>(null); // Add state to hold modal text
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFileModalVisible, setIsFileModalVisible] = useState(false);
    const [base64, setBase64] = useState<any>();
    const [fileBase64, setFileBase64] = useState<any>();
    const [url, setUrl] = useState<any>();
    const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
    const [fileTitle, setFileTitle] = useState<any>();

    useEffect(() => {
        if (call2 || filterFormData || selectedRowData) { // Add condition to check for changes
            fetchWIList();
            setActiveRowKeys([]);
        }
    }, [call2, filterFormData, selectedRowData]);


    const fetchWIList = async () => {
        const cookies = parseCookies();
        let podResponse;
        // console.log("cookies: ", cookies);
        setUserName(cookies?.rl_user_id)
        const site = cookies.site;
        const url = window.location.href;
        const urlParams = new URL(url).searchParams;
        const podName = urlParams.get('WorkStation');
        try {
            podResponse = await retrievePOD({ site, podName });
        }
        catch (error) {
            console.error("Error retrieving Pod: ", error);
        }
        // console.log("Pod response: ", podResponse);
        const aWiList = podResponse?.listOptions[0]?.workInstructionList;

        const params = {
            site,
            resource: filterFormData?.defaultResource || '',
            operationBO: filterFormData?.defaultOperation || '',
            pcu: pcu,
            list: aWiList,
            category: "Work Instruction",
            routing: selectedRowData?.[0]?.router?.split("/")[0],
            routingVersion: selectedRowData?.[0]?.router?.split("/")[1],
            item: selectedRowData?.[0]?.item?.split("/")[0],
            itemVersion: selectedRowData?.[0]?.item?.split("/")[1],
            shopOrder,
            "workCenterBO": "",
            "resourceType": "",
            "customerOrder": "",
            "itemGroup": "",
        };

        try {
            // debugger
            let oWiList;
            console.log("WI List request: ", params);
            const response = await retrieveWIList(params);
            console.log("WI Lis API response: ", response);
            if (response && !response.errorCode) {
                // Flatten the columnLists from the response
                oWiList = response.flatMap(item => item.columnLists);
                console.log("WI list response: ", oWiList);

                const desiredOrder = [
                    "StepId",
                    "Operation_StepId",
                    "WorkInstructionID_Revision",
                    "WorkInstruction_Description",
                    "instructionType",
                    "currentVersion",
                    "status"
                ];

                const columns = desiredOrder.map(title => {
                    const item = oWiList.find(item => item.dataField === title);
                    return item ? {
                        title: t(item.dataField),
                        dataIndex: item.dataField,
                        key: item.dataField,
                        align: 'center' as 'left' | 'right' | 'center',
                    } : null;
                }).filter(column => column !== null); // Filter out any null values

                let formattedOutput = response.map(item => {
                    const result = {} as any;
                    item.columnLists.forEach((column, index) => {
                        result[column.dataField] = column.dataAttribute;
                        // result.key = index;
                        // result.id = index;
                    });
                    return result;
                });

                formattedOutput = formattedOutput.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index
                }));

                // console.log("Formatted Output: ", formattedOutput);
                setWiList(formattedOutput); // Set the data source for the table
                setOWITableColumns(columns); // Set the columns for the table
                console.log("WI list data: ", wiList);
                console.log("WI list columns: ", oWITableColumns);
            }
            else {
                message.destroy();
                setWiList([]);
                setOWITableColumns([]);
                if(response?.errorCode){
                    if(response?.errorCode == '3703')
                        message.error(response?.message);
                }
               
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleRowDoubleClick = async (record) => {
        let operationVersion;
        const workInstruction = record.WorkInstructionID_Revision.split("/")[0];
        const revision = record.WorkInstructionID_Revision.split("/")[1];
        const cookies = parseCookies();
        const site = cookies.site;
        // console.log("Work Instruction: ", workInstruction);
        // console.log("Revision: ", revision);
        try {
            const req = { site, workInstruction, revision };
            console.log("WI retrieve request: ", req);
            const response = await retrieveWI({ site, workInstruction, revision });
            console.log("WI retrieve response: ", response);
            handleWIResponse(response);

            // const site = cookies.site;
            const url = window.location.href;
            const urlParams = new URL(url).searchParams;
            const podName = urlParams.get('WorkStation');
            const podResponse = await retrievePOD({ site, podName });
            // console.log("Pod response: ", podResponse);
            const aWiList = podResponse?.listOptions[0]?.workInstructionList;


            try {
                const operation = filterFormData?.defaultOperation;
                const operationVersionResponse = await retrieveOperationVersion(site, operation);
                operationVersion = operationVersionResponse?.revision;
            }
            catch (error) {
                console.error("Error retrieving Pod: ", error);
            }

            const params = {
                site,
                "pcuBO": "PcuBO:" + site + "," + pcu,
                "userId": "UserBO:" + site + "," + userName,
                "operationBO": "OperationBO:" + site + "," + filterFormData?.defaultOperation + "," + operationVersion,
                "shopOrderBO": "ShopOrderBO:" + site + "," + shopOrder,
                "workCenterBO": "WorkCenterBO:" + site + "," + "",
                "routerBO": "RoutingBO:" + site + "," + selectedRowData?.[0]?.router.split("/")[0] + "," + selectedRowData?.[0]?.router.split("/")[1],
                "resourceBO": "ResourceBO:" + site + "," + filterFormData?.defaultResource || '',
                "itemBO": "ItemBO:" + site + "," + selectedRowData?.[0]?.item.split("/")[0] + "," + selectedRowData?.[0]?.item.split("/")[1],
                "workInstruction": workInstruction,
                "revision": revision,
                "description": record.WorkInstruction_Description,
                "instructionType": record.instructionType,
            };

            try {
                console.log("Production log request: ", params);
                const productionLogResponse = await productionlog(params);
                console.log("Production log response: ", productionLogResponse);
            }
            catch (error) {
                console.error("Error logging record in production log: ", error);
            }
        }
        catch (error) {
            console.error("Error fetching WI: ", error);
        }



    };

    const getFileExtension = (filename) => {
        // Use regex to match the extension
        const match = filename.match(/\.([a-zA-Z0-9]+)$/);
        return match ? match[1] : ''; // Return the extension or an empty string if none found
    }

    const handleWIResponse = (response) => {
        const instructionType = response.instructionType;
        setFileTitle(response?.fileName);
        if (instructionType.toLowerCase() === "text") {
            setModalText(response.text);
            setModalVisible(true);


        }
        else if (instructionType.toLowerCase() === "url") {
            console.log("Url instruction: ", response.url);
            // debugger
            if (response.alwaysShowInNewWindow)
                window.open(response.url, '_blank');
            else {
                setIsUrlModalVisible(true);
                setUrl(response.url);
            }
        }

        else if (instructionType.toLowerCase() === "file") {
            // debugger
            const fileName = response.fileName;
            const path = response.file;
            const extension = getFileExtension(fileName);
            console.log("Extension: ", extension);



            if (extension.toLowerCase() == "pdf") {
                const fileBase64Data = "data:application/pdf;base64," + path;
                if (response.alwaysShowInNewWindow) {
                    openBase64PdfInNewTab(fileBase64Data);
                }
                else {
                    setFileBase64(fileBase64Data);
                    setIsFileModalVisible(true);
                }
            }

            else if (extension.toLowerCase() == "jpeg" || extension.toLowerCase() == "jpg" || extension.toLowerCase() == "png") {
                const base64Data = "data:image/png;base64," + path;
                if (response.alwaysShowInNewWindow)
                    openBase64ImageInNewTab(base64Data);
                else {
                    setBase64(base64Data);
                    setIsModalVisible(true);
                }
            }

            else if (extension.toLowerCase() == "doc") {
                const base64DataDoc = "data:application/msword;base64," + path; // Your DOC base64 string here
                openBase64DocInNewTab(base64DataDoc, "doc");
            }

            else if (extension.toLowerCase() == "docx") {
                const base64DataDocx = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + path; // Your DOCX base64 string here
                openBase64DocInNewTab(base64DataDocx, "docx");
            }

            else if (extension.toLowerCase() == "xlsx") {
                const base64DataXlsx = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + path; // Your XLSX base64 string here
                openBase64ExcelInNewTab(base64DataXlsx, "xlsx");
            }

            else if (extension.toLowerCase() == "xls") {
                const base64DataXls = "data:application/vnd.ms-excel;base64," + path; // Your XLS base64 string here
                openBase64ExcelInNewTab(base64DataXls, "xls");
            }


        }
    }

    const openBase64ExcelInNewTab = (base64Data, fileType = "xlsx") => {
        // Define MIME types for XLS and XLSX
        const mimeType = fileType === "xls"
            ? "application/vnd.ms-excel"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        // Remove the base64 prefix if it exists
        const base64Content = base64Data.replace(/^data:application\/(vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet);base64,/, "");

        // Decode the base64 string
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Create a URL for the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Fallback to download if viewing isn't supported
        window.open(blobUrl, "_blank");
    };

    const openBase64DocInNewTab = (base64Data, fileType = "docx") => {
        // Define MIME types for DOC and DOCX
        const mimeType = fileType === "doc"
            ? "application/msword"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        // Remove the base64 prefix if it exists
        const base64Content = base64Data.replace(/^data:application\/(msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,/, "");

        // Decode the base64 string
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Create a URL for the Blob and open it in a new tab
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    }

    const openBase64ImageInNewTab = (base64Data: string) => {
        // Extract the MIME type and base64 content
        const mimeMatch = base64Data.match(/^data:image\/(png|jpeg|jpg);base64,/);
        const mimeType = mimeMatch ? mimeMatch[0].split(";")[0].replace("data:", "") : "image/png";
        const base64Content = base64Data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

        // Convert the base64 string to a Blob
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Create a URL for the Blob and open it in a new tab
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    }

    function openBase64PdfInNewTab(base64Data) {
        // Remove the base64 prefix if it exists
        const base64Content = base64Data.replace(/^data:application\/pdf;base64,/, "");

        // Decode the base64 string
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create a URL for the Blob and open it in a new tab
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    }

    // Usage example



    const handleFileModalCancel = () => {
        setIsModalVisible(false);
        setIsFileModalVisible(false);
        setIsUrlModalVisible(false);
        
    };


    return (
        <div className={styles.container}>
            <div className={`${styles.firstChild} ${open ? styles.shifted : ''}`}>
                <div className={styles.subTitle} style={{marginTop: '-3%'}}>
                    <p><span className={styles.subTitleText}>{ filterFormData?.podCategory?.toLowerCase() == 'process' ? t('batchNo') : t('pcu')}: </span> { filterFormData?.podCategory?.toLowerCase() == 'process' ? selectedRowData[0]?.batchNo : selectedRowData[0]?.pcu}</p>
                    <p><span className={styles.subTitleText}>{t('operation')}: </span> {filterFormData?.defaultOperation}</p>
                    <p><span className={styles.subTitleText}>{t('resource')}: </span> {filterFormData?.defaultResource}</p>
                    <p><span className={styles.subTitleText}> {t('qty')}: </span> {selectedRowData[0]?.qty}</p>
                    <p><span className={styles.subTitleText}>{t('order')}: </span> { filterFormData?.podCategory?.toLowerCase() == 'process' ? selectedRowData[0]?.orderNumber : selectedRowData[0]?.shopOrder}</p>
                </div><br />

                <Table
                    className={styles.assemblyTable}
                    dataSource={wiList}
                    columns={oWITableColumns}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    scroll={{ y: 55 * 5 }}
                    bordered
                    rowSelection={{
                        type: 'radio', // Change to 'radio' for single row selection
                        selectedRowKeys: activeRowKeys, // Change 'activeRowKeys' to 'selectedRowKeys'
                        onChange: (newSelectedRowKeys) => {
                            setActiveRowKeys(newSelectedRowKeys); // Update the selected row keys state
                        }
                    }}
                    onRow={(record) => ({
                        onDoubleClick: () => {
                            setActiveRowKeys([record.key]); // Update selected row key on row click
                            console.log("Record: ", record);
                            handleRowDoubleClick(record);
                        },
                    })}
                    
                />


            </div>

            <Modal
                title={t("textInstruction")}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                height={"100vh"}
                width={"100vh"}

                style={{
                    position: 'fixed',
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    overflow: 'auto'
                }}
            >
                <p>{modalText}</p> {/* Display the text in the modal */}
            </Modal>

            <Modal
                title={fileTitle}
                open={isModalVisible}
                onCancel={handleFileModalCancel}
                height={"100vh"}
                width={"100vh"}
                footer={null} // Remove footer if you don't need additional actions
                style={{
                    position: 'fixed',
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {/* Render the base64 image */}
                <img
                    src={base64}
                    alt="Preview"
                    style={{ width: "100%", height: "auto" }}
                />
            </Modal>

            <Modal
                title={fileTitle}
                open={isFileModalVisible}
                onCancel={handleFileModalCancel}
                footer={null} // Remove footer if you don't need additional actions
                height={"100vh"}
                width={"100vh"}
                style={{
                    position: 'fixed',
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}

            >
                {/* Render PDF in iframe */}
                <iframe
                    src={fileBase64}
                    title={fileTitle}
                    width="100%"
                    height="500px"

                    style={{
                        border: "none",

                    }}
                />
            </Modal>

            <Modal
                title={t('urlInstruction')}
                open={isUrlModalVisible}
                onCancel={handleFileModalCancel}
                footer={null}
                height={'60vh'}
                width={'80%'}
            >
                <iframe
                    src={url}
                    style={{ width: '100%', height: "70vh", border: 'none' }}
                    title="Embedded URL"
                />
            </Modal>

        </div>
    );
};

export default WIMain;
