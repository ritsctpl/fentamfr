import React, { useRef, useState, useEffect } from 'react';
import { Input, InputNumber, Select, Switch, Upload, Button, Tooltip, DatePicker } from 'antd';
import type { InputNumberProps } from 'antd';
import { CameraOutlined, UploadOutlined, DeleteOutlined, LockOutlined, SignatureOutlined, SearchOutlined } from '@ant-design/icons';
import { Column, Validation } from './types';
import styled from 'styled-components';
import TextArea from 'antd/es/input/TextArea';
import moment from 'moment';

// Styled components for cell rendering
const CellInput = styled(Input)`
  &.editing {
    padding: 4px 8px;
    margin: -5px -9px;
    border: 1px solid #1890ff !important;
    border-radius: 2px;
    background: white;
  }
`;

const CellInputNumber = styled(InputNumber)`
  width: 100%;
  &.editing {
    padding: 4px 8px;
    margin: -5px -9px;
    border: 1px solid #1890ff !important;
    border-radius: 2px;
    background: white;
  }
`;

const CellSelect = styled(Select)`
  width: 100%;
  &:hover .ant-select-selector, &.ant-select-focused .ant-select-selector {
    background-color: #f0f7ff !important;
  }
  &.editing {
    .ant-select-selector {
      padding: 4px 8px !important;
      border: 1px solid #1890ff !important;
      border-radius: 2px !important;
      background: white !important;
    }
  }
`;

const CellSwitch = styled(Switch)`
  display: block;
  margin: 0 auto;
`;

const EmptyCell = styled.div<{ $readOnly?: boolean }>`
  color: #bbb;
  font-style: italic;
  text-align: start;
  padding: 8px 0;
  padding: 4px 8px;
  cursor: ${props => props.$readOnly ? 'not-allowed' : 'text'};
  display: flex;
  align-items: center;
`;

const ReadOnlyIndicator = styled.span`
  margin-left: 4px;
  color: #999;
  font-size: 12px;
`;

const FileCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DisplayValue = styled.div<{ $hasUnit?: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${props => props.$hasUnit ? 'default' : 'text'};
`;

const UnitLabel = styled.span`
  margin-left: 4px;
  color: #888;
  font-size: 12px;
`;

// New styled component for signature
const SignatureBox = styled.div`
  border: 1px dashed #d9d9d9;
  border-radius: 2px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  
  &:hover {
    border-color: #1890ff;
  }
`;

// New styled component for lookup
const LookupField = styled.div`
  display: flex;
  align-items: center;
  
  .ant-input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  .lookup-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

// Add a styled component for the error message
const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 2px;
`;

interface EditableCellProps {
  value: any;
  column: Column;
  rowIndex: number;
  onUpdate: (rowIndex: number, fieldId: string, value: any) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  column,
  rowIndex,
  onUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Validate immediately when focused
      validateValue(value);
    }
  }, [editing]);

  // Validation function
  const validateValue = (val: any): boolean => {
    // Clear previous error
    setError(null);

    // Required validation
    if (column.required && (val === undefined || val === null || val === '')) {
      setError('This field is required');
      return false;
    }

    // Number validations
    if (column.fieldType === 'number' && val !== undefined && val !== null && val !== '') {
      const numVal = Number(val);
      const { min, max } = column.validation || {};

      if (!isNaN(numVal)) {
        if (min !== undefined && numVal < min) {
          setError(`Value must be at least ${min}`);
          return false;
        }
        if (max !== undefined && numVal > max) {
          setError(`Value must be at most ${max}`);
          return false;
        }
      } else {
        setError('Please enter a valid number');
        return false;
      }
    }

    // Text length validation
    if ((column.fieldType === 'text' || column.fieldType === 'lookup') &&
      typeof val === 'string' &&
      column.maxLength !== undefined &&
      val.length > column.maxLength) {
      setError(`Text must be at most ${column.maxLength} characters`);
      return false;
    }

    return true;
  };

  const handleStartEdit = () => {
    if (!column.readOnly) {
      setEditing(true);
      validateValue(localValue);
    }
  };

  const handleChange = (val: any) => {
    setLocalValue(val);
    validateValue(val);

    // For immediate validation fields like number, update immediately if valid
    if (column.fieldType === 'number' && validateValue(val)) {
      onUpdate(rowIndex, column.fieldId, val);
    }
  };

  const handleFinishEdit = () => {
    if (validateValue(localValue)) {
      setEditing(false);
      if (localValue !== value) {
        onUpdate(rowIndex, column.fieldId, localValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setError(null);
      setEditing(false);
    }
  };

  // Helper to get validation values
  const getValidationValue = (key: keyof Validation): any => {
    if (!column.validation) return undefined;

    // Check if validation is an object with min/max
    if (typeof column.validation === 'object' && !Array.isArray(column.validation)) {
      return (column.validation as any)[key];
    }

    return undefined;
  };

  // For read-only cells, display the value with proper formatting
  if (column.readOnly) {
    if (value === undefined || value === null || value === '') {
      return (
        <Tooltip title="This field is read-only">
          <EmptyCell $readOnly>
            Enter to edit <LockOutlined style={{ marginLeft: 4 }} />
          </EmptyCell>
        </Tooltip>
      );
    }

    if (column.fieldType === 'boolean') {
      return <CellSwitch checked={value} disabled />;
    }

    // Show number with proper formatting
    if (column.fieldType === 'number') {
      const formattedValue = typeof value === 'number' && column.precision !== undefined
        ? value.toFixed(column.precision)
        : value;

      return (
        <Tooltip title="This field is read-only">
          <DisplayValue $hasUnit={!!column.unit}>
            {formattedValue}
            {column.unit && <UnitLabel>({column.unit})</UnitLabel>}
            <ReadOnlyIndicator><LockOutlined /></ReadOnlyIndicator>
          </DisplayValue>
        </Tooltip>
      );
    }

    // For other types, just show the value with a lock icon
    return (
      <Tooltip title="This field is read-only">
        <DisplayValue>
          {value}
          <ReadOnlyIndicator><LockOutlined /></ReadOnlyIndicator>
        </DisplayValue>
      </Tooltip>
    );
  }

  // If value is empty/null/undefined, show placeholder
  if (!editing && (value === undefined || value === null || value === '')) {
    if (!['boolean', 'image', 'file', 'signature'].includes(column.fieldType)) {
      return <EmptyCell onClick={handleStartEdit}>Enter to edit</EmptyCell>;
    }
  }

  // If not editing and we have a value, show formatted display value for certain types
  if (!editing && value !== undefined && value !== null && value !== '') {
    if (column.fieldType === 'number' && column.unit) {
      const formattedValue = typeof value === 'number' && column.precision !== undefined
        ? value.toFixed(column.precision)
        : value;

      return (
        <DisplayValue $hasUnit={true} onClick={handleStartEdit}>
          {formattedValue}
          <UnitLabel>({column.unit})</UnitLabel>
        </DisplayValue>
      );
    }

    // For enum/select fields, show the label instead of the value
    if ((column.fieldType === 'enum' || column.fieldType === 'select') && column.options) {
      const option = column.options.find(opt => opt.value === value);
      if (option) {
        return <div onClick={handleStartEdit}>{option.label}</div>;
      }
    }
  }

  const renderEditableCell = () => {
    switch (column.fieldType) {
        case 'number':
        const validateNumberValue = (value: number | string | null) => {
          if (value === null || value === undefined || value === '') {
            if (column.required) {
              setError('This field is required');
              return false;
            }
            setError(null);
            return true;
          }

          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue)) {
            setError('Please enter a valid number');
            return false;
          }

          if (column.validation?.min !== undefined && numValue < column.validation.min) {
            setError(`Value must be at least ${column.validation.min}`);
            return false;
          }
          if (column.validation?.max !== undefined && numValue > column.validation.max) {
            setError(`Value must be at most ${column.validation.max}`);
            return false;
          }

          setError(null);
          return true;
        };

        const handleNumberChange: InputNumberProps['onChange'] = (value) => {
          handleChange(value);
          validateNumberValue(value);
        };

            return (
          <Tooltip title={error} open={!!error} placement="topLeft">
            <CellInputNumber
              ref={inputRef}
              className={editing ? 'editing' : ''}
              value={localValue}
              onChange={handleNumberChange}
              onStep={(value) => {
                handleChange(value);
                validateNumberValue(value);
              }}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              min={column.validation?.min}
              max={column.validation?.max}
              precision={column.precision !== undefined ? column.precision : 2}
              bordered={editing}
              controls={true}
              keyboard={true}
              status={error ? 'error' : undefined}
              addonAfter={editing && column.unit ? column.unit : null}
                    style={{ width: '100%' }}
                />
          </Tooltip>
            );
        case 'boolean':
            return (
          <CellSwitch
            checked={localValue}
            onChange={(checked) => {
              handleChange(checked);
              onUpdate(rowIndex, column.fieldId, checked);
            }}
                />
            );
        case 'enum':
      case 'select':
        return (
          <CellSelect
            ref={inputRef}
            className={editing ? 'editing' : ''}
            value={localValue}
            onChange={(val) => {
              handleChange(val);
              onUpdate(rowIndex, column.fieldId, val);
            }}
            onBlur={handleFinishEdit}
            options={column.options?.map(opt => ({ label: opt.label, value: opt.value }))}
            bordered={editing}
            dropdownMatchSelectWidth={false}
          />
        );
      case 'date':
            return (
          <DatePicker
            value={localValue ? moment(localValue) : null}
            onChange={(date) => {
              handleChange(date ? date.format('YYYY-MM-DD') : null);
              if (date) {
                onUpdate(rowIndex, column.fieldId, date.format('YYYY-MM-DD'));
              }
            }}
                    style={{ width: '100%' }}
          />
        );
      case 'lookup':
        return (
          <LookupField>
            <Input
              ref={inputRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={handleKeyDown}
              style={{ width: 'calc(100% - 32px)' }}
            />
            <Button
              className="lookup-button"
              icon={<SearchOutlined />}
              onClick={() => {
                // In a real app, this would open a lookup dialog
                console.log(`Looking up values from ${column.endpoint}`);
              }}
            />
          </LookupField>
        );
      case 'formula':
        // Formula fields are read-only by nature
        return <span>{localValue}</span>;
        case 'image':
        case 'file':
        return value ? (
          <FileCell>
            <span style={{ marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {typeof value === 'object' ? value.name : value}
            </span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onUpdate(rowIndex, column.fieldId, null)}
            />
          </FileCell>
        ) : (
          <FileCell>
                <Upload
                    accept={column.fileTypes?.join(',')}
                    maxCount={1}
              showUploadList={false}
                    beforeUpload={() => false}
                    onChange={(info) => {
                        if (info.file) {
                  onUpdate(rowIndex, column.fieldId, info.file);
                }
              }}
            >
              <Button
                type="text"
                size="small"
                icon={column.fieldType === 'image' ? <CameraOutlined /> : <UploadOutlined />}
              >
                {column.fieldType === 'image' ? 'Image' : 'File'}
                    </Button>
                </Upload>
          </FileCell>
        );
      case 'signature':
        return value ? (
          <FileCell>
            <span style={{ marginRight: '8px' }}>Signed</span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => onUpdate(rowIndex, column.fieldId, null)}
            />
          </FileCell>
        ) : (
          <SignatureBox onClick={() => {
            // In a real app, this would open a signature pad
            onUpdate(rowIndex, column.fieldId, "Signature captured");
          }}>
            <SignatureOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <div>Sign here</div>
          </SignatureBox>
            );
        default:
        if (column.multiline) {
          return (
            <TextArea
              ref={inputRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setLocalValue(value);
                  setEditing(false);
                }
              }}
              maxLength={column.maxLength}
              rows={column.rows || 3}
              autoSize={{ minRows: column.rows || 3 }}
            />
          );
        }

            return (
          <CellInput
            ref={inputRef}
            className={editing ? 'editing' : ''}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
                    maxLength={column.maxLength}
            bordered={editing}
                />
            );
    }
};

  return (
    <div onClick={handleStartEdit} style={{ cursor: column.readOnly ? 'not-allowed' : 'text' }}>
      {renderEditableCell()}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default EditableCell;