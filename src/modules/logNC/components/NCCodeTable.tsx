import React, { useEffect } from 'react';
import { Table } from 'antd';
import { retrieveNcCode, retrieveDataType } from '@services/logNCService';
import { parseCookies } from 'nookies';
import { LogNCContext } from '../hooks/logNCContext';
import { useTranslation } from 'react-i18next';

interface NCCodeTableProps {
    ncCodeList: any[];
    setNcCodeList: (list: any[]) => void;
    dataType: any;
    setDataType: (type: any) => void;
    datafieldList: any[];
    setDatafieldList: (list: any[]) => void;
}

const NCCodeTable: React.FC<NCCodeTableProps> = ({ ncCodeList, setDataType, setDatafieldList, }) => {
    const { setShowDataFields, setNcCodeValue, selectedNcCodeRowKey, setSelectedNcCodeRowKey, setChildNC,
        selectedNcTreeRowKey, setTranformDataFields, setDataFieldsValue } = React.useContext(LogNCContext);

    useEffect(() => {
        setSelectedNcCodeRowKey(undefined);
    }, [ncCodeList]);

    const { t } = useTranslation();

    const dataSourceWithKeys = React.useMemo(() => {
        return ncCodeList?.map(item => ({
            ...item,
            key: item.ncCode
        }));
    }, [ncCodeList]);

    const columns = [
        {
            title: t('ncCode'),
            dataIndex: 'ncCode',
            key: 'ncCode',
        },
    ];

    const rowSelection = {
        type: 'radio' as const,
        selectedRowKeys: selectedNcCodeRowKey ? [selectedNcCodeRowKey] : [],
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
            const newKey = selectedRowKeys[0];
            const selectedRecord = selectedRows[0];
            setSelectedNcCodeRowKey(newKey === selectedNcCodeRowKey ? undefined : newKey);
            if (newKey !== selectedNcCodeRowKey) {
                handleNcCodeRowClick(selectedRecord?.ncCode);
            }
        },
        preserveSelectedRowKeys: false
    };

    const onRow = (record: any) => ({
        onClick: async () => {
            const newKey = record.key === selectedNcCodeRowKey ? undefined : record.key;
            if (!newKey) {
                setShowDataFields(false);
            }
            setSelectedNcCodeRowKey(newKey);

            if (newKey !== undefined) {
                // try {
                //     const cookies = parseCookies();
                //     const site = cookies.site;
                //     const request = {site, ncCode: record?.ncCode};
                //     const response = await retrieveNcCode(request);
                //     if(!response.errorCode){
                //         setDataType(response?.ncDatatype);
                //         setNcCodeValue(response?.ncCode);
                //         try{
                //             const oDataType = response?.ncDatatype;
                //             const category = 'NC';
                //             const request = {site, dataType: oDataType, category};
                //             const dataTypeResponse = await retrieveDataType(request);
                //             if(!dataTypeResponse.errorCode){
                //                 setShowDataFields(true);
                //                 setDatafieldList(dataTypeResponse?.dataFieldList);
                //             }
                //         }
                //         catch(error){
                //             console.error('Error fetching data type :', error);
                //         }

                //     }
                // }
                // catch(error){
                //     console.error('Error fetching NC code :', error);
                // }

                handleNcCodeRowClick(record?.ncCode);
            }
        }
    });

    const handleNcCodeRowClick = async (ncCode: string) => {
        try {
            const cookies = parseCookies();
            const site = cookies.site;
            const request = { site, ncCode: ncCode };
            debugger
            if (selectedNcTreeRowKey) {
                // setChildNC(ncCode);
            }
            const response = await retrieveNcCode(request);
            if (!response.errorCode) {
                setDataType(response?.ncDatatype);
                // if(selectedNcTreeRowKey){
                setNcCodeValue(response?.ncCode);
                // }
                try {
                    const oDataType = response?.ncDatatype;
                    const category = 'NC';
                    const request = { site, dataType: oDataType, category };
                    const dataTypeResponse = await retrieveDataType(request);
                    if (!dataTypeResponse.errorCode) {
                       



                        let sDataFields = dataTypeResponse?.dataFieldList;
                        // console.log("sDataFields", sDataFields);
                        if (sDataFields.length > 0) {
                            let aDataFields = sDataFields.map((item) => ({
                                sequence: item.sequence,
                                dataField: item.dataField,
                                description: item.description,
                                value: null,
                                required: item.required,
                                dataType: item.dataType
                            }));

                            // console.log("aDataFields", aDataFields);
                            setShowDataFields(true);
                            setDatafieldList(aDataFields);
                            setTranformDataFields(aDataFields);
                        }
                        else{
                            setShowDataFields(false);
                            setDatafieldList([]);
                            setTranformDataFields([]);
                        }
                    }
                    else{
                        setShowDataFields(false);
                        setDataFieldsValue({});
                        setDatafieldList([]);
                        setTranformDataFields([]);
                    }

                }
                catch (error) {
                    console.error('Error fetching data type :', error);
                }

            }
        }
        catch (error) {
            console.error('Error fetching NC code :', error);
        }
    }

    return (
        <Table
            dataSource={dataSourceWithKeys}
            columns={columns}
            rowSelection={rowSelection}
            onRow={onRow}
            bordered
            size="small"
            pagination={false}
            style={{ fontSize: '12px' }}
            scroll={{ y: 'calc(100vh - 500px)' }}
        />
    );
};

export default NCCodeTable;
