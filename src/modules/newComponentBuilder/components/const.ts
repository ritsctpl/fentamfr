export const templateStructure = {
  "templateMetadata": {
    "templateId": "template_granulation_mfr_001",
    "templateName": "Granulation Master Formula Record",
    "templateVersion": "1.0",
    "derivedFromTemplate": "template_granulation_mfr_001",
    "customizationsApplied": true,
    "productSpecific": true
  },
  "sections": [
    {
      "sectionRef": "section_preparation_001",
      "sectionSequence": 1,
      "inheritSequence": true,
      "customized": true,
      "definition": {
        "sectionId": "section_preparation_001",
        "sectionName": "LINE CLEARANCE FOR MANUFACTURING",
        "sectionVersion": "1.0",
        "classification": ["Preparation", "MFR", "BMR", "Paracetamol"],
        "active": true,
        "description": "Equipment preparation stage for Paracetamol granulation including line clearance.",
        "sequenceOrder": 1,
        "visualization": {
          "titleDisplay": true,
          "sectionAlignment": "center",
          "pageBreakBefore": true,
          "backgroundShading": "#F9F9F9"
        },
        "forms": [
          {
            "formRef": "form_line_clearance_001",
            "formSequence": 1,
            "inheritSequence": true,
            "customized": true,
            "definition": {
              "formId": "form_line_clearance_001",
              "formName": "Line Clearance Form - Paracetamol Production",
              "formVersion": "1.0",
              "classification": ["MFR", "BMR", "LineClearance", "Paracetamol"],
              "sequenceOrder": 1,
              "inheritSequence": true,
              "components": [
                {
                  "componentRef": "comp_table_enterprise_full_002",
                  "componentUsage": "Area Check Table",
                  "componentSequence": 2,
                  "componentAlignment": "left",
                  "inheritSequence": true,
                  "showComponentTitle": true,
                  "customized": true,
                  "definition": {
                    "componentId": "comp_table_enterprise_full_002",
                    "componentName": "Paracetamol Granulation Check Table",
                    "componentType": "table",
                    "componentVersion": "6.0",
                    "componentSequence": 2,
                    "active": true,
                    "description": "Paracetamol specific granulation parameters with enhanced validations.",
                    "createdBy": "mes_architect",
                    "created_at": "2025-06-21T10:00:00Z",
                    "modifiedBy": "qa_head",
                    "modifiedAt": "2025-06-21T11:00:00Z",
                    "site": "PLANT_001",
                    "tags": ["bmr", "mes", "gmp", "validated", "paracetamol"],
                    "executionMode": "online_offline",
                    "deviationAllowed": true,
                    "tableConfig": {
                      "columns": [
                        {
                          "fieldName": "Equipment",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "equipment"
                        },
                        {
                          "fieldName": "Calibration SOP No.  & calibrated on date",
                          "fieldType": "date",
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "calibration_sop_no_calibrated_on_date"
                        },
                        {
                          "fieldName": "Operation SOP No",
                          "fieldType": "number",
                          "precision": 1,
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "operation_sop_no"
                        },
                        {
                          "fieldName": "Operator name",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "operator_name"
                        },
                        {
                          "fieldName": "Checked by Prod",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "checked_by_prod"
                        },
                        {
                          "fieldName": "Verified by QA",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "verified_by_qa"
                        }
                      ],
                      "headerStructure": [],
                      "rowControls": {
                        "mode": "growing",
                        "minRows": 1,
                        "maxRows": 10,
                        "allowAddRemove": true,
                        "initialRows": 1
                      },
                      "pagination": {
                        "enabled": false,
                        "rowsPerPage": 10
                      },
                      "columnLayout": {
                        "columnCount": 1,
                        "columnWidthMode": "auto",
                        "stickyHeaders": true,
                        "resizableColumns": true
                      },
                      "style": {
                        "tableBorder": true,
                        "stripedRows": true,
                        "alternateRowColor": "#ffffff",
                        "headerColor": "#f0f0f0",
                        "headerFontColor": "#000000"
                      },
                      "preloadRows": [
                        {
                          "equipment": "Weighing balance"
                        },
                        {
                          "equipment": "Melting kettle"
                        },
                        {
                          "equipment": "Main mixing  vessel"
                        },
                        {
                          "equipment": "Homogenizer "
                        },
                        {
                          "equipment": "Stirrer"
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      "sectionRef": "section_preparation_002",
      "sectionSequence": 1,
      "inheritSequence": true,
      "customized": true,
      "definition": {
        "sectionId": "section_preparation_002",
        "sectionName": "MANUFACTURING",
        "sectionVersion": "1.0",
        "classification": ["Preparation", "MFR", "BMR", "Paracetamol"],
        "active": true,
        "description": "Equipment preparation stage for Paracetamol granulation including line clearance.",
        "sequenceOrder": 1,
        "visualization": {
          "titleDisplay": true,
          "sectionAlignment": "center",
          "pageBreakBefore": true,
          "backgroundShading": "#F9F9F9"
        },
        "forms": [
          {
            "formRef": "form_manufacturing_001",
            "formSequence": 1,
            "inheritSequence": true,
            "customized": true,
            "definition": {
              "formId": "form_manufacturing_001",
              "formName": "Manufacturing Form - Paracetamol Production",
              "formVersion": "1.0",
              "classification": ["MFR", "BMR", "LineClearance", "Paracetamol"],
              "sequenceOrder": 1,
              "inheritSequence": true,
              "components": [
                {
                  "componentRef": "comp_table_enterprise_full_001",
                  "componentUsage": "Area Check Table",
                  "componentSequence": 2,
                  "componentAlignment": "left",
                  "inheritSequence": true,
                  "showComponentTitle": true,
                  "customized": true,
                  "definition": {
                    "componentId": "comp_table_enterprise_full_001",
                    "componentName": "Paracetamol Granulation Check Table",
                    "componentType": "table",
                    "componentVersion": "6.0",
                    "componentSequence": 2,
                    "active": true,
                    "description": "Paracetamol specific granulation parameters with enhanced validations.",
                    "createdBy": "mes_architect",
                    "created_at": "2025-06-21T10:00:00Z",
                    "modifiedBy": "qa_head",
                    "modifiedAt": "2025-06-21T11:00:00Z",
                    "site": "PLANT_001",
                    "tags": ["bmr", "mes", "gmp", "validated", "paracetamol"],
                    "executionMode": "online_offline",
                    "deviationAllowed": true,
                    "tableConfig": {
                      "columns": [
                        {
                          "fieldName": "Date",
                          "fieldType": "date",
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "date"
                        },
                        {
                          "fieldName": "Step",
                          "fieldType": "number",
                          "precision": 1,
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "step"
                        },
                        {
                          "fieldName": "Procedure",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "procedure"
                        },
                        {
                          "fieldName": "Qty",
                          "fieldType": "number",
                          "unit": "kg",
                          "precision": 1,
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "qty"
                        },
                        {
                          "fieldName": "From",
                          "fieldType": "date",
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "from"
                        },
                        {
                          "fieldName": "To",
                          "fieldType": "date",
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "to"
                        },
                        {
                          "fieldName": "Observation",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "observation"
                        },
                        {
                          "fieldName": "Done By",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "done_by"
                        },
                        {
                          "fieldName": "Ckd By",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "ckd_by"
                        }
                      ],
                      "headerStructure": [
                        {
                          "id": "time_0339",
                          "label": "Time",
                          "children": [],
                          "columns": [
                            "from",
                            "to"
                          ]
                        }
                      ],
                      "rowControls": {
                        "mode": "growing",
                        "minRows": 1,
                        "maxRows": 10,
                        "allowAddRemove": true,
                        "initialRows": 1
                      },
                      "pagination": {
                        "enabled": false,
                        "rowsPerPage": 10
                      },
                      "columnLayout": {
                        "columnCount": 1,
                        "columnWidthMode": "auto",
                        "stickyHeaders": true,
                        "resizableColumns": true
                      },
                      "style": {
                        "tableBorder": true,
                        "stripedRows": true,
                        "alternateRowColor": "#ffffff",
                        "headerColor": "#f0f0f0",
                        "headerFontColor": "#000000"
                      },
                      "preloadRows": [
                        {
                          "date": "2025-07-10",
                          "step": 1.3,
                          "procedure": "To melting tank, Transfer",
                          "qty": 10,
                          "from": "2025-07-09",
                          "to": "2025-07-10"
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      "sectionRef": "section_preparation_003",
      "sectionSequence": 1,
      "inheritSequence": true,
      "customized": true,
      "definition": {
        "sectionId": "section_preparation_003",
        "sectionName": "RAW MATERIALS DISPENSING",
        "sectionVersion": "1.0",
        "classification": ["Preparation", "MFR", "BMR", "Paracetamol"],
        "active": true,
        "description": "Equipment preparation stage for Paracetamol granulation including line clearance.",
        "sequenceOrder": 1,
        "visualization": {
          "titleDisplay": true,
          "sectionAlignment": "center",
          "pageBreakBefore": true,
          "backgroundShading": "#F9F9F9"
        },
        "forms": [
          {
            "formRef": "form_line_clearance_001",
            "formSequence": 1,
            "inheritSequence": true,
            "customized": true,
            "definition": {
              "formId": "form_line_clearance_001",
              "formName": "Line Clearance Form - Paracetamol Production",
              "formVersion": "1.0",
              "classification": ["MFR", "BMR", "LineClearance", "Paracetamol"],
              "sequenceOrder": 1,
              "inheritSequence": true,
              "components": [
                {
                  "componentRef": "comp_table_enterprise_full_001",
                  "componentUsage": "Area Check Table",
                  "componentSequence": 2,
                  "componentAlignment": "left",
                  "inheritSequence": true,
                  "showComponentTitle": true,
                  "customized": true,
                  "definition": {
                    "componentId": "comp_table_enterprise_full_001",
                    "componentName": "Paracetamol Granulation Check Table",
                    "componentType": "table",
                    "componentVersion": "6.0",
                    "componentSequence": 2,
                    "active": true,
                    "description": "Paracetamol specific granulation parameters with enhanced validations.",
                    "createdBy": "mes_architect",
                    "created_at": "2025-06-21T10:00:00Z",
                    "modifiedBy": "qa_head",
                    "modifiedAt": "2025-06-21T11:00:00Z",
                    "site": "PLANT_001",
                    "tags": ["bmr", "mes", "gmp", "validated", "paracetamol"],
                    "executionMode": "online_offline",
                    "deviationAllowed": true,
                    "tableConfig": {
                      "columns": [
                        {
                          "fieldName": "Parameters",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "parameters"
                        },
                        {
                          "fieldName": "Observation",
                          "fieldType": "enum",
                          "defaultValue": "yes",
                          "options": [
                            {
                              "label": "Yes",
                              "value": "yes"
                            },
                            {
                              "label": "No",
                              "value": "no"
                            }
                          ],
                          "required": false,
                          "read_only": false,
                          "multiline": false,
                          "capture_camera": false,
                          "fieldId": "observation"
                        },
                        {
                          "fieldName": "Ckd By  Stores  supervisor",
                          "fieldType": "text",
                          "defaultValue": "",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "ckd_by_stores_supervisor"
                        },
                        {
                          "fieldName": "Verified  by QA",
                          "fieldType": "text",
                          "multiline": false,
                          "required": false,
                          "read_only": false,
                          "capture_camera": false,
                          "fieldId": "verified_by_qa"
                        }
                      ],
                      "headerStructure": [],
                      "rowControls": {
                        "mode": "growing",
                        "minRows": 1,
                        "maxRows": 10,
                        "allowAddRemove": true,
                        "initialRows": 1
                      },
                      "pagination": {
                        "enabled": false,
                        "rowsPerPage": 10
                      },
                      "columnLayout": {
                        "columnCount": 1,
                        "columnWidthMode": "auto",
                        "stickyHeaders": true,
                        "resizableColumns": true
                      },
                      "style": {
                        "tableBorder": true,
                        "stripedRows": true,
                        "alternateRowColor": "#ffffff",
                        "headerColor": "#f0f0f0",
                        "headerFontColor": "#000000"
                      },
                      "preloadRows": [
                        {
                          "parameters": "Cleanliness of the Dispensing area as per SOP",
                          "observation": "yes",
                          "ckd_by_stores_supervisor": ""
                        },
                        {
                          "parameters": "Accessories/scoops/spatula cleaned as per SOP",
                          "observation": "yes",
                          "ckd_by_stores_supervisor": ""
                        }
                      ]
                    }
                  }
                },
                {
                  "componentRef": "comp_form_enterprise_full_001",
                  "componentUsage": "Area Check Form",
                  "componentSequence": 2,
                  "componentAlignment": "right",
                  "inheritSequence": true,
                  "showComponentTitle": false,
                  "customized": true,
                  "definition": {
                    "componentId": "comp_form_enterprise_full_001",
                    "componentName": "Paracetamol Granulation Check Form",
                    "componentType": "form",
                    "componentVersion": "6.0",
                    "componentSequence": 2,
                    "active": true,
                    "description": "Paracetamol specific granulation parameters with enhanced validations.",
                    "createdBy": "mes_architect",
                    "created_at": "2025-06-21T10:00:00Z",
                    "modifiedBy": "qa_head",
                    "modifiedAt": "2025-06-21T11:00:00Z",
                    "site": "PLANT_001",
                    "tags": ["bmr", "mes", "gmp", "validated", "paracetamol"],
                    "executionMode": "online_offline",
                    "deviationAllowed": true,
                    "fields":[
                      {
                          "fieldType": "text",
                          "required": false,
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "dataSource": "user_input",
                          "instructionLevel": "field",
                          "layoutColumn": 2,
                          "fieldName": "Dispensing Booth Cubical No",
                          "displayMode": "",
                          "multiline": false,
                          "content": [
                              ""
                          ],
                          "templateText": "",
                          "fieldId": "dispensing_booth_cubical_no"
                      },
                      {
                          "fieldType": "text",
                          "required": false,
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "dataSource": "user_input",
                          "instructionLevel": "field",
                          "layoutColumn": 2,
                          "fieldName": "Previous Product",
                          "displayMode": "",
                          "multiline": false,
                          "content": [
                              "hin"
                          ],
                          "templateText": "",
                          "fieldId": "1752140676516"
                      },
                      {
                          "fieldType": "text",
                          "required": false,
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "dataSource": "user_input",
                          "instructionLevel": "field",
                          "layoutColumn": 2,
                          "fieldName": "Batch No",
                          "displayMode": "",
                          "multiline": false,
                          "content": [
                              ""
                          ],
                          "templateText": "",
                          "fieldId": "batch_no"
                      },
                      {
                          "fieldType": "text",
                          "required": false,
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "dataSource": "user_input",
                          "instructionLevel": "field",
                          "layoutColumn": 2,
                          "fieldName": "Dispensing started At",
                          "displayMode": "",
                          "multiline": false,
                          "content": [
                              ""
                          ],
                          "templateText": "",
                          "fieldId": "1752140721083"
                      },
                      {
                          "fieldType": "text",
                          "required": false,
                          "readOnly": false,
                          "labelPosition": "left",
                          "alignment": "left",
                          "dataSource": "user_input",
                          "instructionLevel": "field",
                          "layoutColumn": 2,
                          "fieldName": "Dispensing completed At",
                          "displayMode": "",
                          "multiline": false,
                          "content": [
                              ""
                          ],
                          "templateText": "",
                          "fieldId": "1752140800462"
                      }
                  ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export const templateDefinition = {
  ObjectTemplate: templateStructure,
  ObjectValues: {}
}