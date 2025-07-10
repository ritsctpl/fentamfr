import React, { useEffect, useState, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import FieldList from './components/FieldList';
import FieldModal from './components/FieldModal';
import { UniversalFormProps, FormField, UserData } from './types';
import { Modal } from 'antd';
import './UniversalForm.css';

const UniversalForm: React.FC<UniversalFormProps> = ({
  setFields,
  templateStructure,
  userData,
  setUserData,
  editMode,
  userRole
}) => {
  const [templateData, setTemplateData] = useState<FormField[]>([]);
  const [localUserData, setLocalUserData] = useState<UserData>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FormField | undefined>();

  // Initialize template data
  useEffect(() => {
    if (templateStructure) {
      setTemplateData(templateStructure);
    }
  }, [templateStructure]);

  // Map user data to form fields
  useEffect(() => {
    if (userData && templateStructure) {
      // First set the local user data
      setLocalUserData(userData);

      // Then map the user data back to the form fields
      const updatedTemplateData = templateStructure.map(field => {
        const userValue = userData[field.fieldId];
        if (userValue === undefined) return field;

        const updatedField = { ...field };

        switch (field.fieldType) {
          case 'text':
            if (field.displayMode === 'static') {
              // Handle static content arrays
              updatedField.content = Array.isArray(userValue) ? userValue : [userValue];
            } else if (field.displayMode === 'prefilled') {
              // Handle prefilled text fields
              if (typeof userValue === 'object' && 'template_text' in userValue) {
                updatedField.templateText = userValue.template_text;
                updatedField.bindingFields = userValue.resolved_values;
              } else if (Array.isArray(userValue)) {
                updatedField.templateText = userValue.join('\n');
              } else {
                updatedField.templateText = String(userValue);
              }
            } else {
              // Handle regular text fields
              if (field.multiline) {
                updatedField.defaultValue = Array.isArray(userValue) 
                  ? userValue.join('\n')
                  : String(userValue);
              } else {
                updatedField.defaultValue = String(userValue);
              }
            }
            break;

          case 'boolean':
            updatedField.defaultValue = Boolean(userValue);
            break;

          case 'enum':
            updatedField.defaultValue = String(userValue);
            break;

          case 'lookup':
            updatedField.defaultValue = String(userValue);
            break;

          case 'formula':
            if (typeof userValue === 'number') {
              updatedField.defaultValue = userValue;
            }
            break;
        }

        return updatedField;
      });

      setTemplateData(updatedTemplateData);
    }
  }, [userData, templateStructure]);

  // Memoize the field update callback
  const handleFieldChange = useCallback((updatedField: FormField) => {
    if (editMode) {
      setTemplateData(prev => prev.map(f => f.fieldId === updatedField.fieldId ? updatedField : f));
    } else {
      setLocalUserData(prev => {
        const newData = { ...prev };
        
        switch (updatedField.fieldType) {
          case 'text':
            if (updatedField.displayMode === 'static' && updatedField.content) {
              // Handle static content arrays
              newData[updatedField.fieldId] = updatedField.content;
            } else if (updatedField.displayMode === 'prefilled' && updatedField.templateText) {
              // Handle prefilled text fields
              if (updatedField.bindingFields) {
                // If the field has binding fields, store template and resolved values
                newData[updatedField.fieldId] = {
                  template_text: updatedField.templateText,
                  resolved_values: updatedField.bindingFields
                };
              } else if (updatedField.multiline) {
                // For multiline prefilled fields without bindings, store as array
                newData[updatedField.fieldId] = updatedField.templateText
                  .split('\n')
                  .filter(line => line.trim() !== '');
              } else {
                // For single line prefilled fields without bindings, store as string
                newData[updatedField.fieldId] = updatedField.templateText;
              }
            } else {
              // Handle regular text fields
              if (updatedField.multiline && updatedField.defaultValue) {
                const value = String(updatedField.defaultValue);
                newData[updatedField.fieldId] = value
                  .split('\n')
                  .filter(line => line.trim() !== '');
              } else {
                newData[updatedField.fieldId] = updatedField.defaultValue || '';
              }
            }
            break;
            
          case 'boolean':
            newData[updatedField.fieldId] = Boolean(updatedField.defaultValue);
            break;
            
          case 'enum':
            newData[updatedField.fieldId] = updatedField.defaultValue || '';
            break;
            
          case 'lookup':
            newData[updatedField.fieldId] = updatedField.defaultValue || '';
            break;
            
          case 'formula':
            if (typeof updatedField.defaultValue === 'number') {
              newData[updatedField.fieldId] = updatedField.defaultValue;
            }
            break;
        }
        
        return newData;
      });
    }
  }, [editMode]);

  // Batch updates to parent components
  useEffect(() => {
    if (setFields) {
      const timeoutId = setTimeout(() => {
        setFields(templateData);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [templateData, setFields]);

  useEffect(() => {
    if (setUserData && !editMode) {
      const timeoutId = setTimeout(() => {
        setUserData(localUserData);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [localUserData, editMode]);

  // Memoize handlers
  const handleAddField = useCallback(() => {
    setEditingField(undefined);
    setModalVisible(true);
  }, []);

  const handleEditField = useCallback((field: FormField) => {
    setEditingField(field);
    setModalVisible(true);
  }, []);

  const handleDeleteField = useCallback((field: FormField) => {
    Modal.confirm({
      title: 'Delete Field',
      content: `Are you sure you want to delete "${field.fieldName}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTemplateData(prev => prev.filter(f => f.fieldId !== field.fieldId));
      },
    });
  }, []);

  const handleSaveField = useCallback((field: FormField) => {
    setTemplateData(prev => {
      if (editingField) {
        return prev.map(f => f.fieldId === field.fieldId ? field : f);
      } else {
        return [...prev, field];
      }
    });
    setModalVisible(false);
  }, [editingField]);

  const canEditField = useCallback((field: FormField): boolean => {
    if (!userRole) return true;
    if (field.roleControl?.editableBy) {
      return field.roleControl.editableBy.includes(userRole);
    }
    return true;
  }, [userRole]);

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