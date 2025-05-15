import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Table, Select, Input, Switch, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/WorkFlowMaintenance.module.css';
import { useMyContext } from '../hooks/workFlowContext';
import { parseCookies } from 'nookies';
import { fetchAllUserGroup, retrieveUserGroup } from '@services/workFlowService';

const { Option } = Select;

interface DataField {
    id: string;
    // label: boolean;
    defaultLabel: boolean;
    sequence: string;
    fieldValue: string;
    labelValue: string;
    type: string;
    width: string;
    value: any[];
    api: string;
    parameters: string;
    userRole: string;
}

const ListTable: React.FC = () => {
    const [listDetails, setListDetails] = useState([]);
    const {payloadData, setPayloadData,  setShowAlert} = useMyContext();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedField, setSelectedField] = useState<any | null>(null);
    const [modalValues, setModalValues] = useState<any[]>(payloadData?.levelConfigurationList);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalSelectedRowKeys, setModalSelectedRowKeys] = useState<React.Key[]>([]);
    
    const { t } = useTranslation();

    useEffect(() => {
        // debugger
        setListDetails(payloadData?.levelConfigurationList);
    }, [payloadData])

    // CRUD functions for listDetails
    const addField = async(field: any) => {
        // debugger
        const cookies = parseCookies();
        const site = cookies?.site;
        const newField = {
            ...field,
            type: 'Input',
            sequence: ((payloadData?.levelConfigurationList?.length + 1) * 10).toString()
        };
        const updatedFields = renumberSequences([...payloadData?.levelConfigurationList, newField]);
        // setListDetails(updatedFields);
        // handleLevelConfig(field?.id, "user", field?.userGroup);

        const userGroup = field?.userGroup;
        const userResponse = await retrieveUserGroup(site, userGroup);
        let userList = [], userDropDownList = [];
        // debugger
        if (!userResponse?.errorCode) {
            userList = userResponse?.users?.map(item => item?.user) || [];
            userDropDownList = userResponse?.users?.map((item, index) => {
                return {
                    id: index,
                    user: item?.user,
                }
            }) || [];
        }
        
        // Set user list
        setPayloadData(prev => ({
          ...prev,
          levelConfigurationList: updatedFields.map(fields =>
            fields.id == field?.id ? {
              ...fields,
              user: userList ,
             
            } : fields
          ),
          userList: userList,
          userDropDownList: userDropDownList
        }));


        // setPayloadData((prev) => ({
        //     ...prev,
        //     levelConfigurationList: updatedFields
        // }));
        setShowAlert(true);
    };

    const updateField = (id: string, key: keyof any, value: any) => {
        let updatedFields;
        
            updatedFields = payloadData?.levelConfigurationList.map(field =>
                field.id === id ? { ...field, [key]: value } : field
            );
        setListDetails(updatedFields);
        if (key == "finalApproval" || key == "action" || key == "user")
            setPayloadData((prev) => ({
                ...prev,
                levelConfigurationList: updatedFields
            }));
        else {
            handleLevelConfig(id, key, value);
        }
        setShowAlert(true);
    };


    const handleLevelConfig = async (id, key, value) => {
        try {
          const cookies = parseCookies();
          const site = cookies?.site;
          
          
          // Fetch users for the selected user group
          const userGroup = value;
          const userResponse = await retrieveUserGroup(site, userGroup);
          let userList = [], userDropDownList = [];
          debugger
          if (!userResponse?.errorCode) {
            userList = userResponse?.users?.map(item => item?.user) || [];
            userDropDownList = userResponse?.users?.map((item, index) => {
                return {
                    id: index,
                    user: item?.user,
          }}) || [];
          }
          
          // Set user list
          setPayloadData(prev => ({
            ...prev,
            levelConfigurationList: payloadData?.levelConfigurationList.map(field =>
              field.id === id ? {
                ...field,
                ...(key == "user" && { user: userList }),
                ...(key == "action" && { action: value }),
                ...(key == "finalApproval" && { finalApproval: value }),
                ...(key == "userRole" && { user: userList, userRole: value } )
              } : field
            ),
            userList: userList,
            userDropDownList: userDropDownList
          }));

         
          
        } catch (e) {
          console.log("Error in retrieving user configuration: ", e);
          // Set empty lists in case of error
          setPayloadData(prev => ({
            ...prev,
            userList: []
          }));
        }
      };

   
  
   

    const baseColumns = [
        {
            title: t('sequence'),
            dataIndex: 'sequence',
            key: 'sequence',
            render: (sequence: string) => (
                <span>{sequence}</span>
            ),
            width: 100
        },
        {
            title: <span>{t('userRole')} </span>,
            dataIndex: 'userRole',
            key: 'userRole',
            render: (userRole: string, record: any) => (
            <Select
                value={userRole}
                defaultValue= {payloadData?.userGroupList?.[0]?.userRole || ""}
                onChange={(value) => updateField(record.id, 'userRole', value)}
                style={{ width: '100%' }}
            >
                {payloadData?.userGroupList?.map((group: any) => (
                    <Option key={group.id} value={group.userGroup}>{group.userRole}</Option>
                ))}
            </Select>
            ),
        },
        {
            title: <span>{t('user')} </span>,
            dataIndex: 'user',
            key: 'user',
            render: (user: string, record: any) => (
                <Select
                    mode='multiple'
                    value={user}
                    defaultValue='Sudarshan'
                    onChange={(value) => updateField(record.id, 'user', value)}
                    style={{ width: '100%' }}
                >
                    {payloadData?.userDropDownList?.map((item: any) => (
                        <Option key={item.id} value={item.user}>{item.user}</Option>
                    ))}
                </Select>
            ),
        },
        {
            title: <span>{t('action')} </span>,
            dataIndex: 'action',
            key: 'action',
            render: (action: string, record: any) => (
                <Select
                    value={action}
                    mode="multiple"
                    defaultValue='Review    '
                    onChange={(value) => updateField(record.id, 'action', value)}
                    style={{ width: '100%' }}
                >
                    <Option value="Review">Review</Option>
                    <Option value="Approval">Approval</Option>
                    <Option value="Reject">Reject</Option>
                </Select>
            ),
        },
        {
            title: t('finalApproval'),
            dataIndex: 'finalApproval',
            key: 'finalApproval',
            render: (finalApproval: boolean, record: any) => (
                <Switch
                    checked={finalApproval}
                    onChange={(checked) => updateField(record.id, 'finalApproval', checked)}
                />
            ),
            width: 130
        },
    ];

    

    const columns = [
        ...baseColumns,
        
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const onModalSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setModalSelectedRowKeys(newSelectedRowKeys);
    };



    // Helper function to renumber sequences
    const renumberSequences = (fields: any) => {
        return fields.map((field, index) => ({
            ...field,
            sequence: ((index + 1) * 10).toString()
        }));
    };

    // Modified function to remove selected fields
    const removeSelectedFields = () => {
        const updatedFields = renumberSequences(listDetails.filter(field => !selectedRowKeys.includes(field.id)));
        setListDetails(updatedFields);
        setPayloadData((prev) => ({
           ...prev,
            levelConfigurationList: updatedFields
        }));
        setSelectedRowKeys([]);
    };


    return (
        <div style={{ marginTop: '-4%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, marginTop: 20, marginRight: 8 }}>
                <Space>
                    <Button className={styles.cancelButton} onClick={() => addField({
                        id: uuidv4(),
                        finalApproval: false,
                        sequence: '',
                        userRole: payloadData?.userGroupList?.[0]?.userRole || "",
                        userGroup: payloadData?.userGroupList?.[0]?.userGroup || "",
                        user: payloadData?.userList?.map(user => user.user) || "",
                        action: 'Review'
                    })}>   {t('insert')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={removeSelectedFields} disabled={selectedRowKeys.length === 0}>
                        {t('removeSelected')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={() => {
                       { setListDetails([]); setPayloadData((prev) => ({ ...prev, levelConfigurationList: [] })); }
                    }}>
                        {t('removeAll')}
                    </Button>
                </Space>
            </div>
            <Table
                dataSource={listDetails || []}
                columns={columns}
                rowKey="id"
                rowSelection={rowSelection}
                bordered
                pagination={false}
                scroll={{ y: 'calc(100vh - 500px)' }}
                size='small'
            />
         
        </div>
    );
};

export default ListTable;
