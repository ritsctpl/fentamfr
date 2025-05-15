import React, { useState, useEffect } from "react";
import { Button, Table, Tabs, Form, Input } from "antd";
import { useBuyOff } from "../hooks/BuyOffContext";
import { GrChapterAdd } from "react-icons/gr";
import {
  fetchAllWorkCenter, fetchResourceAll, fetchResourceTop50, fetchShopAllData, fetchShopTop50, fetchTop50Item, fetchTop50Operation, fetchTop50Routing,
  fetchTop50WorkCenter, retrieveAllItem, retrieveAllItemGroup,
  retrieveListOfPCU, retrieveTop50ItemGroup
} from '@services/dataCollectionServices';
import { DynamicBrowse } from "@components/BrowseComponent";
interface AttachmentFormProps {
  rowSelectedData?: any;
  onDataChange?: () => void;
}

const DynamicForm = ({ rowSelectedData, onDataChange }: AttachmentFormProps) => {
  const [form] = Form.useForm();
  const { selectedRowData, setSelectedRowData } = useBuyOff();
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!rowSelectedData) {
      form.resetFields();
      setResetKey(prev => prev + 1);
      return;
    }

    const formData = {
      sequence: rowSelectedData.sequence || '',
      quantityRequired: rowSelectedData.quantityRequired || '',
      stepId: rowSelectedData.stepId || '',
      itemGroup: rowSelectedData.itemGroup || '',
      item: rowSelectedData.item || '',
      itemVersion: rowSelectedData.itemVersion || '',
      recipe: rowSelectedData.recipe || '',
      recipeVersion: rowSelectedData.recipeVersion || '',
      routing: rowSelectedData.routing || '',
      routingVersion: rowSelectedData.routingVersion || '',
      operation: rowSelectedData.operation || '',
      operationVersion: rowSelectedData.operationVersion || '',
      workCenter: rowSelectedData.workCenter || '',
      resource: rowSelectedData.resource || '',
      shopOrder: rowSelectedData.shopOrder || '',
      pcu: rowSelectedData.pcu || '',
      orderNumber: rowSelectedData.orderNumber || '',
      batchNo: rowSelectedData.batchNo || ''
    };

    form.setFieldsValue(formData);
    setResetKey(prev => prev + 1);
  }, [rowSelectedData, form]);

  const onFinish = (values: any) => {
    if (selectedRowData?.attachmentList) {
      const updatedAttachmentList = selectedRowData.attachmentList.map((item: any) => {
        if (item.sequence === values.sequence) {
          return { ...item, ...values };
        }
        return item;
      });

      setSelectedRowData({
        ...selectedRowData,
        attachmentList: updatedAttachmentList
      });
      
      onDataChange?.(); // Call onDataChange when data is updated
    }
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    form.submit(); // This will trigger onFinish whenever any value changes
  };

  const [data, setData] = useState<any[]>(
    [
      {
        "label": "Sequence",
        "name": "sequence",
        "type": "input"
      },
      {
        "label": "Quantity Required",
        "name": "quantityRequired",
        "type": "input"
      },
      {
        "label": "Step ID",
        "name": "stepId",
        "type": "input"
      },
      
      {
        "label": "Item",
        "name": "item",
        "type": "browse",
        "api": "item-service",
        "key": "retrieveTop50"
      },
      {
        "label": "Item Version",
        "name": "itemVersion",
        "type": "input"
      },
      // {
      //   "label": "Routing",
      //   "name": "routing",
      //   "type": "browse",
      //   "api": "routing-service",
      //   "key": "retrieveTop50"
      // },
      {
        "label": "Recipe",
        "name": "recipe",
        "type": "browse",
        "api": "recipe-service",
        "key": "retrieveAll"
      },
      {
        "label": "Recipe Version",
        "name": "recipeVersion",
        "type": "input"
      },
      // {
      //   "label": "Routing Version",
      //   "name": "routingVersion",
      //   "type": "input"
      // },
      {
        "label": "Operation",
        "name": "operation",
        "type": "browse",
        "api": "operation-service",
        "key": "retrieveTop50"
      },
      {
        "label": "Operation Version",
        "name": "operationVersion",
        "type": "input"
      },
      {
        "label": "Work Center",
        "name": "workCenter",
        "type": "browse",
        "api": "workcenter-service",
        "key": "retrieveTop50"
      },
      {
        "label": "Resource",
        "name": "resource",
        "type": "browse",
        "api": "resource-service",
        "key": "resource"
      },
      // {
      //   "label": "Shop Order",
      //   "name": "shopOrder",
      //   "type": "browse",
      //   "api": "shoporder-service",
      //   "key": "retrieveTop50"
      // },
      {
        "label": "Process Order",
        "name": "orderNumber",
        "type": "browse",
        "api": "processorder-service",
        "key": "retrieveAll"
      },
      // {
      //   "label": "PCU",
      //   "name": "pcu",
      //   "type": "browse",
      //   "api": "pcuheader-service",
      //   "key": "retrieveTop50"
      // },
      {
        "label": "Batch No",
        "name": "batchNo",
        "type": "browse",
        "api": "batchnoinqueue-service",
        "key": "getInQueueForBatchRecipeByFilters"
      }
    ]
  );

  return (
    <Form
      form={form}
      initialValues={rowSelectedData}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      autoComplete="off"
    >
      {data.map((item, index) => (
        <Form.Item 
          style={{ width: '60%' }} 
          key={index} 
          label={item.label} 
          name={item.name}
        >
          {item.type === 'input' ? (
            <Input 
              onChange={(e) => {
                const newValue = e.target.value
                  .toUpperCase()
                  .replace(/\s+/g, '')
                  .replace(/[^A-Z0-9_]/g, '');
                form.setFieldsValue({
                  [item.name]: newValue
                });
              }}
            />
          ) : (
            <DynamicBrowse
              key={`${resetKey}-${item.name}`}
              initial={rowSelectedData?.[item.name] || ''}
              uiConfig={{
                label: "",
                sorting: false,
                selectEventApi:item.key,
                tabledataApi: item.api,
                okButtonVisible: true,
                selectEventCall: false,
                multiSelect: false,
                tableTitle: item.label,
              }}
              onSelectionChange={(selectedValue: any) => {
                console.log('Selected Value:', selectedValue);
                if (selectedValue && Array.isArray(selectedValue) && selectedValue.length > 0) {
                  const value = selectedValue[0];
                  console.log('First Value:', value);
                  
                  const updateObject = {
                    [item.name]:item.name === 'item' ? value.item :
                                item.name === 'routing' ? value.routing :
                                item.name === 'recipe' ? value.recipeId :
                                item.name === 'operation' ? value.operation :
                                item.name === 'workCenter' ? value.workCenter :
                                item.name === 'resource' ? value.resource :
                                item.name === 'shopOrder' ? value.shopOrder :
                                item.name === 'orderNumber' ? value.orderNumber :
                                item.name === 'batchNo' ? value.batchNo :
                                value[item.name],
                    ...(item.name === 'item' && { itemVersion: value.revision }),
                    ...(item.name === 'routing' && { routingVersion: value.version }),
                    ...(item.name === 'recipe' && { recipeVersion: value.version }),
                    ...(item.name === 'operation' && { operationVersion: value.revision }),
                    ...(item.name === 'orderNumber' && { orderNumber: value.orderNumber }),
                    ...(item.name === 'batchNo' && { batchNo: value.batchNo })
                  };

                  form.setFieldsValue(updateObject);
                  form.submit();
                }
              }}
            />
          )}
        </Form.Item>
      ))}
    </Form>
  );
};

const AttachmentForm: React.FC<AttachmentFormProps> = ({ rowSelectedData, onDataChange }) => {
  const { setAttachment } = useBuyOff();
  const items = [
    { 
      label: 'Main', 
      key: 'attachmentList', 
      children: <DynamicForm rowSelectedData={rowSelectedData} onDataChange={onDataChange} />
    }
  ];

  return (
    <div style={{ padding: '10px', width: '100%', display: 'flex', }}>
      <div style={{
        padding: '10px',
        width: '100%',
        height: 'calc(100vh - 360px)',
        overflow: 'auto'
      }}>
        Attachment Details
        <Tabs items={items} />
      </div>
    </div>
  );
};

export default AttachmentForm;