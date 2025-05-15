import { Form, Input, Switch } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { InventoryContext } from '../hooks/InventoryContext';

// Define and export a constant
export const initialValues = {
    storageLocation: null,
    productionSupplyArea: null,
    storageBin: null,
    handlingUnitNumber: null,
    masterHandlingUnitNumber: null,
    workCenter: null,
    workCenterVersion: null,
    workCenterReserve: false,
    operation: null,
    qtyonHand: 0.0,
    operationVersion: null,
    operationReserve: false,
    resource: null,
    resourceVersion: null,
    resourceReserve: false,
    shopOrder: "TABLET002",
    shopOrderVersion: null,
    shopOrderReserve: false
};

// Define CreateForm as a functional component
const InventoryLocation: React.FC = () => {

    const {formData, setFormData} = useContext(InventoryContext);
    const [formFields, setFormFields] = useState(formData?.inventoryIdLocation);

    useEffect(() => {
        setFormFields(formData?.inventoryIdLocation?.[0]);
    }, [formData?.inventoryIdLocation]);

    const handleSwitchChange = (key: string) => (checked: boolean) => {
        setFormFields((prevFields) => ({
            ...prevFields,
            [key]: checked,
        }));
    };
    const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormFields((prevFields) => ({
            ...prevFields,
            [key]: e.target.value,
        }));
    };
    return (
        <Form
        style={{ width: '90%' }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}>
           
            {formFields && typeof formFields === 'object' && Object.entries(formFields).map(([key, value]) => (
                <Form.Item key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>
                    {typeof value === 'boolean' ? (
                        <Switch checked={value} onChange={handleSwitchChange(key)} />
                    ) : (
                        <Input value={value?.toString() ?? ''} onChange={handleInputChange(key)} />   
                    )}
                </Form.Item>
            ))}
        </Form>
    );
};

export default InventoryLocation;
