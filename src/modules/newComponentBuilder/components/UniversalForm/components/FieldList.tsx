// components/FieldList.tsx
import React from 'react';
import FieldCard from './FieldCard';
import { FormField } from '../types';
import '../UniversalForm.css';

interface FieldListProps {
  templateData: FormField[];
  onEdit?: (field: FormField) => void;
  onDelete?: (field: FormField) => void;
  canEditField: (field: FormField) => boolean;
  onFieldChange?: (field: FormField) => void;
}

const FieldList: React.FC<FieldListProps> = ({
  templateData,
  onEdit,
  onDelete,
  canEditField,
  onFieldChange
}) => {
  return (
    <div className="field-grid">
      {templateData.map((field) => (
        <FieldCard
          key={field.field_id}
          field={field}
          onEdit={canEditField(field) ? onEdit : undefined}
          onDelete={canEditField(field) ? onDelete : undefined}
          onChange={onFieldChange}
        />
      ))}
    </div>
  );
};

export default FieldList;
