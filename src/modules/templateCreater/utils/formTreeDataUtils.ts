import { FormFieldNode, FormSection, FormGroupSection, FormTreeData } from '../types/formTreeTypes';

/**
 * Converts raw form JSON data to the FormTreeData structure
 * @param formJson The raw JSON form configuration
 * @returns FormTreeData structure
 */
export const convertJsonToFormTreeData = (formJson: any): FormTreeData => {
  const result: FormTreeData = {
    sections: []
  };

  if (!formJson || !formJson.template) {
    return result;
  }

  // Process each section in the template
  Object.entries(formJson.template).forEach(([key, sectionData]: [string, any]) => {
    if (!sectionData || typeof sectionData !== 'object') {
      return;
    }

    // Handle section group
    if (sectionData.type === 'SectionGroup') {
      const groupSection: FormGroupSection = {
        id: sectionData.id || key,
        title: sectionData.heading || sectionData.section || 'Unnamed Group',
        sections: []
      };

      // Process nested sections
      if (sectionData.sections && Array.isArray(sectionData.sections)) {
        sectionData.sections.forEach((nestedSection: any, index: number) => {
          // Only process valid section objects
          if (!nestedSection || typeof nestedSection !== 'object') {
            return;
          }

          const section: FormSection = {
            id: nestedSection.id || `nested-${index}`,
            title: nestedSection.heading || nestedSection.section || `Nested Section ${index + 1}`,
            fields: []
          };

          // Process components in nested section
          if (nestedSection.component && typeof nestedSection.component === 'object') {
            Object.entries(nestedSection.component).forEach(([compKey, comp]: [string, any]) => {
              if (!comp || typeof comp !== 'object') {
                return;
              }

              // Create field from component
              const field: FormFieldNode = {
                id: compKey,
                type: comp.type || 'text',
                label: comp.label || compKey
              };

              // Add additional properties if available
              if (comp.placeholder) field.placeholder = comp.placeholder;
              if (comp.required !== undefined) field.required = comp.required;
              if (comp.defaultValue !== undefined) field.defaultValue = comp.defaultValue;
              if (comp.options) field.options = comp.options;
              if (comp.validation) field.validation = comp.validation;

              section.fields.push(field);
            });
          }

          // Add text content as a field if it exists
          if (nestedSection.content !== undefined) {
            section.fields.push({
              id: `content-${section.id}`,
              type: 'textarea',
              label: 'Text Content',
              defaultValue: nestedSection.content
            });
          }

          // Add the nested section to the group
          groupSection.sections.push(section);
        });
      }

      // Add the group section to the result
      result.sections.push(groupSection);
    } 
    // Handle regular section
    else {
      const section: FormSection = {
        id: sectionData.id || key,
        title: sectionData.heading || sectionData.section || 'Unnamed Section',
        fields: []
      };

      // Process components in section
      if (sectionData.component && typeof sectionData.component === 'object') {
        Object.entries(sectionData.component).forEach(([compKey, comp]: [string, any]) => {
          if (!comp || typeof comp !== 'object') {
            return;
          }

          // Create field from component
          const field: FormFieldNode = {
            id: compKey,
            type: comp.type || 'text',
            label: comp.label || compKey
          };

          // Add additional properties if available
          if (comp.placeholder) field.placeholder = comp.placeholder;
          if (comp.required !== undefined) field.required = comp.required;
          if (comp.defaultValue !== undefined) field.defaultValue = comp.defaultValue;
          if (comp.options) field.options = comp.options;
          if (comp.validation) field.validation = comp.validation;

          section.fields.push(field);
        });
      }

      // Add text content as a field if it exists
      if (sectionData.content !== undefined) {
        section.fields.push({
          id: `content-${section.id}`,
          type: 'textarea',
          label: 'Text Content',
          defaultValue: sectionData.content
        });
      }

      // Add the section to the result
      result.sections.push(section);
    }
  });

  return result;
};

/**
 * Converts FormTreeData structure back to the JSON format
 * @param formTreeData The FormTreeData structure
 * @returns JSON object in the application's format
 */
export const convertFormTreeDataToJson = (formTreeData: FormTreeData): any => {
  const result: any = { template: {} };

  if (!formTreeData.sections || formTreeData.sections.length === 0) {
    return result;
  }

  // Process each section in the tree data
  formTreeData.sections.forEach((section, index) => {
    // Handle group section
    if ('sections' in section) {
      // Create section group entry
      result.template[`sectionGroup${index}`] = {
        id: section.id,
        section: section.title,
        heading: section.title,
        type: 'SectionGroup',
        sections: []
      };

      // Process nested sections
      section.sections.forEach((nestedSection) => {
        const sectionJson: any = {
          id: nestedSection.id,
          section: nestedSection.title,
          heading: nestedSection.title,
          type: 'Section',
          component: {}
        };

        // Process fields in nested section
        nestedSection.fields.forEach((field) => {
          // Handle text content field
          if (field.type === 'textarea' && field.id.startsWith('content-')) {
            sectionJson.content = field.defaultValue || '';
            sectionJson.type = 'Text Section';
          } 
          // Handle regular form fields
          else {
            sectionJson.component[field.id] = {
              type: field.type,
              label: field.label
            };

            // Add additional properties if available
            if (field.placeholder) sectionJson.component[field.id].placeholder = field.placeholder;
            if (field.required !== undefined) sectionJson.component[field.id].required = field.required;
            if (field.defaultValue !== undefined) sectionJson.component[field.id].defaultValue = field.defaultValue;
            if (field.options) sectionJson.component[field.id].options = field.options;
            if (field.validation) sectionJson.component[field.id].validation = field.validation;
          }
        });

        // Add nested section to the group
        result.template[`sectionGroup${index}`].sections.push(sectionJson);
      });
    } 
    // Handle regular section
    else {
      const sectionJson: any = {
        id: section.id,
        section: section.title,
        heading: section.title,
        type: 'Section',
        component: {}
      };

      // Flag to check if this is a text section
      let isTextSection = false;

      // Process fields in section
      section.fields.forEach((field) => {
        // Handle text content field
        if (field.type === 'textarea' && field.id.startsWith('content-')) {
          sectionJson.content = field.defaultValue || '';
          sectionJson.type = 'Text Section';
          isTextSection = true;
        } 
        // Handle regular form fields
        else {
          sectionJson.component[field.id] = {
            type: field.type,
            label: field.label
          };

          // Add additional properties if available
          if (field.placeholder) sectionJson.component[field.id].placeholder = field.placeholder;
          if (field.required !== undefined) sectionJson.component[field.id].required = field.required;
          if (field.defaultValue !== undefined) sectionJson.component[field.id].defaultValue = field.defaultValue;
          if (field.options) sectionJson.component[field.id].options = field.options;
          if (field.validation) sectionJson.component[field.id].validation = field.validation;
        }
      });

      // If it's a text section and there are no fields, remove the component property
      if (isTextSection && Object.keys(sectionJson.component).length === 0) {
        delete sectionJson.component;
      }

      // Add section to the result
      if (isTextSection) {
        result.template[`textSection${index}`] = sectionJson;
      } else {
        result.template[`section${index}`] = sectionJson;
      }
    }
  });

  return result;
};

/**
 * Creates a new form field node
 * @param type Field type
 * @param label Field label
 * @returns New FormFieldNode object
 */
export const createFormField = (
  type: string = 'text',
  label: string = 'New Field',
  options?: {
    id?: string;
    required?: boolean;
    placeholder?: string;
    defaultValue?: any;
    validation?: any;
    options?: {label: string; value: string}[];
  }
): FormFieldNode => {
  const fieldId = options?.id || `field-${Date.now()}`;
  
  const field: FormFieldNode = {
    id: fieldId,
    type,
    label
  };

  // Add optional properties if provided
  if (options?.required !== undefined) field.required = options.required;
  if (options?.placeholder) field.placeholder = options.placeholder;
  if (options?.defaultValue !== undefined) field.defaultValue = options.defaultValue;
  if (options?.validation) field.validation = options.validation;
  if (options?.options) field.options = options.options;

  return field;
};

/**
 * Creates a new form section
 * @param title Section title
 * @returns New FormSection object
 */
export const createFormSection = (
  title: string = 'New Section',
  options?: {
    id?: string;
    fields?: FormFieldNode[];
  }
): FormSection => {
  return {
    id: options?.id || `section-${Date.now()}`,
    title,
    fields: options?.fields || []
  };
};

/**
 * Creates a new form group section
 * @param title Group section title
 * @returns New FormGroupSection object
 */
export const createFormGroupSection = (
  title: string = 'New Group',
  options?: {
    id?: string;
    sections?: FormSection[];
  }
): FormGroupSection => {
  return {
    id: options?.id || `group-${Date.now()}`,
    title,
    sections: options?.sections || []
  };
}; 