import React, { useEffect, useState } from 'react';
import Toolbar from './components/Toolbar';
import FieldList from './components/FieldList';
import FieldModal from './components/FieldModal';
import { UniversalFormProps, FormField } from './types';
import { Modal } from 'antd';
import './UniversalForm.css';

const UniversalForm: React.FC<UniversalFormProps> = ({
  setFields,
  editMode,
  userRole
}) => {
  const [templateData, setTemplateData] = useState<FormField[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FormField | undefined>();

  useEffect(() => {
    setFields(templateData)
  }, [templateData]);

  const handleAddField = () => {
    setEditingField(undefined);
    setModalVisible(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setModalVisible(true);
  };

  const handleDeleteField = (field: FormField) => {
    Modal.confirm({
      title: 'Delete Field',
      content: `Are you sure you want to delete "${field.field_name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTemplateData(prev => prev.filter(f => f.field_id !== field.field_id));
      },
    });
  };

  const handleSaveField = (field: FormField) => {
    setTemplateData(prev => {
      if (editingField) {
        return prev.map(f => f.field_id === field.field_id ? field : f);
      } else {
        return [...prev, field];
      }
    });
    setModalVisible(false);
  };

  const handleFieldChange = (updatedField: FormField) => {
    setTemplateData(prev => prev.map(f => f.field_id === updatedField.field_id ? updatedField : f));
  };

  const canEditField = (field: FormField): boolean => {
    if (!userRole) return true;
    if (field.role_control?.editable_by) {
      return field.role_control.editable_by.includes(userRole);
    }
    return true;
  };

  return (
    <div className="universal-form-container">
      {editMode && (
        <Toolbar
          onAdd={handleAddField}
        />
      )}
      <FieldList
        templateData={templateData}
        onEdit={editMode ? handleEditField : undefined}
        onDelete={editMode ? handleDeleteField : undefined}
        canEditField={canEditField}
        onFieldChange={handleFieldChange}
      />
      <FieldModal
        visible={modalVisible}
        field={editingField}
        onSave={handleSaveField}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default UniversalForm;