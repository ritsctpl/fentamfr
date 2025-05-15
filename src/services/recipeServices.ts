import { use } from "react";
import api from "./api";
import { version } from "os";

export const fetchResource = async (site: string, userId: string, url: string) => {
  console.log(site,userId,url,'gfhfh');
  try {
      const response = await api.post(`${url}-service/retrieveBySite`, { site, userId });
      console.log(response);
      
      return response.data;
  } catch (error) {
      console.error('API Error:', error);
      throw error;
  }
};

export const retrieveAllBOM = async (site: string, bom: string) => {
  const response = await api.post('/bom-service/retrieveAll', { site, bom });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.bomList;
};

export const retrieveTop50BOM = async (site: string) => {
  const response = await api.post('/bom-service/retrieveTop50', { site });
  // console.log(response,'bom retrieve all by site Response');
  
  return response.data.bomList;
};

export const fetchTop50Routing = async (site: string) => {
  const response = await api.post('/recipe-service/retrieveAll', { site ,user:"senthil"});
  console.log(response.data,'recipe retrieve all by site Response');
  
  return response.data.responseList
  ;
};

export const retrieveTop50DocumentList = async (site: string) => {
  const response = await api.post('/document-service/retrieveTop50', { site });
  // console.log(response,'Document List Response');
  
  return response.data.documentResponseList;
};

export const retrieveAllDocumentList = async (site: string, document: string) => {
  const response = await api.post('/document-service/retrieveAll', { site, document });
  // console.log(response,'Document List Response');
  
  return response.data.documentResponseList;
};

export const retrieveAllRecipe = async (site: string) => {
  const response = await api.post('/recipe-service/retrieveAll', { site });
  // console.log(response,'Routing List Response');
  
  return response.data.responseList;
};

export const updateStep = async (params) => {
  console.log(params,'Step List Response');
  const response = await api.post('/recipe-service/updatePhaseOperation',  params );
  console.log(response,params,'Step List update');
  
  return response.data;
};
export const addStep = async (params) => {
  console.log(params,'Step List Response');
  const response = await api.post('/recipe-service/addPhaseOperation',  params );
  console.log(response,params,'Step List Responsek');
  
  return response.data;
};
export const retrieveAllStep = async (site ,params) => {
  const response = await api.post('/recipe-service/getPhaseOperations', {site,...params });
  console.log(response,params,'Step List get1');
  
  return response.data.ops;
};

export const getPhaseStepById = async (site ,params) => {
  const response = await api.post('/recipe-service/getPhaseOperationById', {site,...params });
  console.log(response,'Step List get');
  
  return response.data.op;
};
export const retrieveAllPhase = async (site,params) => {
  
  const response = await api.post('/recipe-service/getRecipePhases', {site,...params });
  console.log(response,'Step List get');
  
  return response.data.phases;
};
export const retrieveTop50Routing = async (site: string) => {
  const response = await api.post('/recipe-service/retrieveTop50', { site });
  console.log(response,'Routing List Response');
  
  return response.data.routingList;
};

export const retrieveErpOperation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveByErpOperation', { site });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

export const retrieveTop50Operation = async (site: string) => {
  const response = await api.post('/operation-service/retrieveTop50', { site });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

export const retrieveAllOperation = async (site: string, operation: string) => {
  const response = await api.post('/operation-service/retrieveByOperation', { site, operation });
  // console.log(response,'retrieve ERP Operation Response');
  
  return response.data.operationList;
};

interface RoutingData {
  site: string
  recipe: string;
  version: string;
  description: string;
  recipeType: string;
  status: string;
  currentVersion: boolean;
  relaxedRoutingFlow: boolean;
  document: string;
  dispositionGroup: string;
  bom: string;
  bomVersion: string;
  replicationToErp: boolean;
  isParentRoute: boolean;
  routingStepList: any[]; // Replace 'any' with the appropriate type if known
  customDataList: any[];  // Replace 'any' with the appropriate type if known
  userId: string;
  createdDateTime: string;
  updatedDateTime: string;
  createdBy: string;
  modifiedBy: string;
};

export const createRecipe = async (recipeData,site) => {
  console.log(site,recipeData,"routingData");
  const param = { 
  
    "recipeId": "RECIPE_1019", 
  
    "version": "00", 
  
    "currentVersion": true, 
  
    "batchSize": "600", 
  
    "batchUom": "KG", 
  
    "totalExpectedCycleTime": "180", 
  
    "totalActualCycleTime": "", 
  
    "scaling": { 
  
      "scalable": true, 
  
      "scalingFactor": "1.52", 
  
      "maxBatchSize": "120", 
  
      "minBatchSize": "550" 
  
    }, 
  
    "ingredients": { 
  
      "active": [ 
  
        { 
  
          "ingredientId": "ING_LASUNA_BULBS", 
  
          "ingreDescription": "Lasuna Bulbs", 
  
          "quantity": "2.5", 
  
          "uom": "KG", 
  
          "sequence": "10", 
  
          "materialDescription": "LASUNA (BULBS) (RCPT) DE IH", 
  
          "storageLocation": "RM03", 
  
          "tolerance": "2", 
  
          "materialType": "Batch-controlled", 
  
          "supplierId": "SUP_1001", 
  
          "sourceLocation": "Factory_A", 
  
          "qcParameters": [ 
  
            { 
  
              "sequence": "10", 
  
              "qcId": "QC_PURITY_1", 
  
              "qcDescription": "abc", 
  
              "parameter": "Purity", 
  
              "actualValue": "5", 
  
              "expectedValue": "5", 
  
              "tolerance": "1" 
  
            }, 
  
            { 
  
              "sequence": "20", 
  
              "qcId": "QC_PURITY_2", 
  
              "qcDescription": "abc", 
  
              "parameter": "Moisture Content", 
  
              "actualValue": "5", 
  
              "expectedValue": "5", 
  
              "tolerance": "0.5" 
  
            } 
  
          ], 
  
          "handlingInstructions": "Store in a cool, dry place", 
  
          "storageInstructions": "Keep below 25°C", 
  
          "unitCost": "10.00", 
  
          "currency": "USD", 
  
          "totalCost": "1500.00", 
  
          "wasteQuantity": "83", 
  
          "wasteUoM": "KG", 
  
          "byProduct": { 
  
            "sequence": "10", 
  
            "byProductId": "BYPROD_001", 
  
            "description": "abc", 
  
            "uom": "KG", 
  
            "byProductQuantity": "33" 
  
          }, 
  
          "hazardous": false, 
  
          "alternateIngredients": [ 
  
            { 
  
              "sequence": "10", 
  
              "ingredientId": "ALT_LASUNA_POWDER", 
  
              "ingreDescription": "Lasuna Powder", 
  
              "quantity": 2, 
  
              "uom": "KG", 
  
              "tolerance": "2", 
  
              "materialDescription": "ALT_LASUNA_POWDER", 
  
              "storageLocation": "RM03", 
  
              "materialType": "Batch-controlled", 
  
              "batchNumber": "BATCH_002", 
  
              "expiryDate":  "2025-11-28T18:30:00.000Z" , 
  
              "manufactureDate":  "2023-01-18T18:30:00.000Z" , 
  
              "qcParameters": [ 
  
                { 
  
                  "sequence": "10", 
  
                  "qcId": "QC_PURITY_3", 
  
                  "qcDescription": "abc", 
  
                  "parameter": "Purity", 
  
                  "actualValue": "5", 
  
                  "expectedValue": "5", 
  
                  "tolerance": "1" 
  
                } 
  
              ], 
  
              "unitCost": "9.50", 
  
              "totalCost": "1330.00" 
  
            } 
  
          ] 
  
        }, 
  
        { 
  
          "ingredientId": "Flour", 
  
          "ingreDescription": "High-quality wheat flour.", 
  
          "quantity": "500", 
  
          "uom": "kg", 
  
          "sequence": "20", 
  
          "materialDescription": "Fine wheat flour used for baking.", 
  
          "storageLocation": "Warehouse A", 
  
          "tolerance": "2", 
  
          "materialType": "Raw Material", 
  
          "supplierId": "SUP001", 
  
          "sourceLocation": "Supplier Warehouse", 
  
          "qcParameters": [ 
  
            { 
  
              "sequence": "10", 
  
              "qcId": "Moisture Content", 
  
              "qcDescription": "Check moisture content to avoid clumping.", 
  
              "parameter": "Moisture", 
  
              "actualValue": "12", 
  
              "expectedValue": "13", 
  
              "monitoringFrequency": "Each batch", 
  
              "toolsRequired": [ 
  
                "Moisture Analyzer" 
  
              ], 
  
              "actionsOnFailure": "Reject batch", 
  
              "tolerance": "1", 
  
              "min": 10, 
  
              "max": 13 
  
            } 
  
          ], 
  
          "handlingInstructions": "Keep in a dry and cool place.", 
  
          "storageInstructions": "Store in sealed containers away from direct sunlight.", 
  
          "unitCost": "0.50", 
  
          "currency": "USD", 
  
          "totalCost": "250.00", 
  
          "wasteQuantity": "2", 
  
          "wasteUoM": "kg", 
  
          "batchNumber": "BATCH202401", 
  
          "byProduct": { 
  
            "sequence": "10", 
  
            "byProductId": "Bran", 
  
            "description": "Leftover bran from flour production.", 
  
            "expectedQuantity": "50", 
  
            "uom": "kg", 
  
            "handlingProcedure": "Pack and store in dry containers.", 
  
            "byProductQuantity": "48", 
  
            "reusable": "Yes", 
  
            "disposalCost": "5.00", 
  
            "currency": "USD", 
  
            "quantityProduced": "48" 
  
          }, 
  
          "hazardous": false, 
  
          "alternateIngredients": [ 
  
            { 
  
              "sequence": "10", 
  
              "ingredientId": "Rice Flour", 
  
              "ingreDescription": "Alternative flour made from rice.", 
  
              "quantity": 500, 
  
              "uom": "kg" 
  
            } 
  
          ], 
  
          "expiryDate":  "2025-12-29T18:30:00.000Z",
  
          "manufactureDate":  "2024-05-30T18:30:00.000Z" 
  
        } 
  
      ], 
  
      "inactive": [ 
  
        { 
  
          "ingredientId": "ING_CELLULOSE_MICROCRYSTALLINE", 
  
          "ingreDescription": "Cellulose Microcrystalline", 
  
          "quantity": "69", 
  
          "uom": "KG", 
  
          "sequence": "10", 
  
          "materialDescription": "CELLULOSE MICROCRYSTALLINE PH.EUR", 
  
          "storageLocation": "RM03", 
  
          "tolerance": "2", 
  
          "materialType": "Batch-controlled", 
  
          "qcParameters": [ 
  
            { 
  
              "sequence": "10", 
  
              "qcId": "QC_PURITY_4", 
  
              "qcDescription": "abc", 
  
              "parameter": "Moisture Content", 
  
              "actualValue": "5", 
  
              "expectedValue": "5", 
  
              "tolerance": "0.5" 
  
            } 
  
          ], 
  
          "handlingInstructions": "Handle with care to avoid contamination", 
  
          "unitCost": "12.00", 
  
          "totalCost": "1480.99", 
  
          "wasteQuantity": "0.05", 
  
          "wasteUoM": "KG", 
  
          "batchNumber": "BATCH_003", 
  
          "hazardous": false, 
  
          "alternateIngredients": [], 
  
          "expiryDate":  "2025-12-29T18:30:00.000Z" , 
  
          "manufactureDate": "2024-05-30T18:30:00.000Z" ,
  
        }, 
  
        { 
  
          "ingredientId": "ING_PREGELATINISED_STARCH", 
  
          "ingreDescription": "Pregelatinised Starch", 
  
          "quantity": "0.502", 
  
          "uom": "KG", 
  
          "sequence": "20", 
  
          "materialDescription": "PREGELATINISED STARCH [UNIGEL 270] BP", 
  
          "storageLocation": "RM03", 
  
          "tolerance": "2", 
  
          "materialType": "Batch-controlled", 
  
          "qcParameters": [ 
  
            { 
  
              "sequence": "10", 
  
              "qcId": "QC_PURITY_5", 
  
              "qcDescription": "abc", 
  
              "parameter": "Moisture Content", 
  
              "actualValue": "5", 
  
              "expectedValue": "5", 
  
              "tolerance": "0.5" 
  
            } 
  
          ], 
  
          "handlingInstructions": "Avoid exposure to moisture", 
  
          "unitCost": "8.50", 
  
          "totalCost": "255.00", 
  
          "wasteQuantity": "83", 
  
          "wasteUoM": "KG", 
  
          "hazardous": false, 
  
          "alternateIngredients": [] 
  
        }, 
  
        { 
  
          "ingredientId": "ING_SILICA_COLLOIDAL", 
  
          "ingreDescription": "Silica Colloidal Anhydrous", 
  
          "quantity": "0.06", 
  
          "uom": "KG", 
  
          "sequence": "30", 
  
          "materialDescription": "SILICA COLLOIDAL ANHYDROUS PH.EUR + IH", 
  
          "storageLocation": "RM03", 
  
          "tolerance": "2", 
  
          "materialType": "Batch-controlled", 
  
          "qcParameters": [ 
  
            { 
  
              "sequence": "10", 
  
              "qcId": "QC_PURITY_6", 
  
              "qcDescription": "abc", 
  
              "parameter": "Moisture Content", 
  
              "actualValue": "5", 
  
              "expectedValue": "5", 
  
              "tolerance": "0.5" 
  
            } 
  
          ], 
  
          "handlingInstructions": "Store in dry conditions, away from direct sunlight", 
  
          "unitCost": "15.00", 
  
          "totalCost": "54.00", 
  
          "wasteQuantity": "33", 
  
          "wasteUoM": "KG", 
  
          "hazardous": false, 
  
          "alternateIngredients": [] 
  
        } 
  
      ] 
  
    }, 
  
    "phases": [ 
  
      { 
  
        "phaseId": "PHASE_SIFTING_BLENDING", 
  
        "phaseDescription": "Sifting & Blending", 
  
        "sequence": "10", 
  
        "entryPhase": true, 
  
        "exitPhase": false, 
  
        "nextPhase": "20", 
  
        "expectedCycleTime": "60", 
  
        "ingredients": { 
  
          "active": [ 
  
            { 
  
              "ingredientId": "ING001", 
  
              "ingreDescription": "Active Ingredient 1", 
  
              "quantity": "10", 
  
              "uom": "kg", 
  
              "sequence": "10", 
  
              "materialDescription": "High-quality material", 
  
              "storageLocation": "Warehouse A", 
  
              "tolerance": "5", 
  
              "materialType": "Type A", 
  
              "supplierId": "SUP001", 
  
              "sourceLocation": "Factory 1", 
  
              "qcParameters": [ 
  
                {} 
  
              ], 
  
              "handlingInstructions": "Handle with care", 
  
              "storageInstructions": "Keep in a cool, dry place", 
  
              "unitCost": "100", 
  
              "currency": "USD", 
  
              "totalCost": "1000", 
  
              "wasteQuantity": "1", 
  
              "wasteUoM": "kg", 
  
              "batchNumber": "B001", 
  
              "byProduct": { 
  
                "byProductId": "BP001" 
  
              }, 
  
              "hazardous": false, 
  
              "alternateIngredients": [ 
  
                { 
  
                  "ingredientId": "ALT001", 
  
                  "quantity": 0 
  
                } 
  
              ], 
  
              "expiryDate": "2025-12-29T18:30:00.000Z" , 
  
              "manufactureDate":  "2024-05-30T18:30:00.000Z" 
  
  
            } 
  
          ], 
  
          "inactive": [ 
  
            { 
  
              "ingredientId": "ING002", 
  
              "ingreDescription": "Inactive Ingredient 1", 
  
              "quantity": "5", 
  
              "uom": "liters", 
  
              "sequence": "10", 
  
              "materialDescription": "Inactive material", 
  
              "storageLocation": "Warehouse B", 
  
              "tolerance": "10", 
  
              "materialType": "Type B", 
  
              "supplierId": "SUP002", 
  
              "sourceLocation": "Factory 2", 
  
              "qcParameters": [], 
  
              "handlingInstructions": "Store separately", 
  
              "storageInstructions": "Protect from sunlight", 
  
              "unitCost": "50", 
  
              "currency": "USD", 
  
              "totalCost": "250", 
  
              "wasteQuantity": "0.5", 
  
              "wasteUoM": "liters", 
  
              "batchNumber": "B002", 
  
              "hazardous": false, 
  
              "alternateIngredients": [], 
  
              "expiryDate": "2025-12-29T18:30:00.000Z" 
  , 
  
              "manufactureDate":  "2024-05-30T18:30:00.000Z" 
  
               
  
            } 
  
          ] 
  
        }, 
  
        "operations": [ 
  
          { 
  
            "operationId": "OPERATION_1", 
  
            "operationDescription": "Add Lasuna Bulbs", 
  
            "sequence": "10", 
  
            "entryOperation": true, 
  
            "lastOperationAtPhase": false, 
  
            "nextOperations": "20", 
  
            "type": "sequential", 
  
            "instruction": "Add 150 KG of Lasuna Bulbs into the sifting machine.", 
  
            "expectedCycleTime": "10", 
  
            "tools": [ 
  
              "scale", 
  
              "sifterA" 
  
            ], 
  
            "resources": [ 
  
              { 
  
                "sequence": "10", 
  
                "resourceId": "R1", 
  
                "description": "Blending Machine", 
  
                "workCenterId": "WC_BLENDING", 
  
                "parameters": { 
  
                  "rpm": 150, 
  
                  "duration": "10" 
  
                } 
  
              } 
  
            ], 
  
            "dataCollection": [ 
  
              { 
  
                "sequence": "10", 
  
                "dataPointId": "D8", 
  
                "description": "abc", 
  
                "parameter": "RPM", 
  
                "expectedValue": "150", 
  
                "allowedVariance": "5", 
  
                "monitoringFrequency": "continuous" 
  
              } 
  
            ], 
  
            "qcParameters": { 
  
              "sequence": "10", 
  
              "qcId": "QC1", 
  
              "qcDescription": "abc", 
  
              "parameter": "Purity", 
  
              "expectedValue": "98", 
  
              "monitoringFrequency": "end of step", 
  
              "toolsRequired": [ 
  
                "Spectrometer" 
  
              ], 
  
              "actionsOnFailure": "Repeat process until 98% purity is achieved." 
  
            }, 
  
            "adjustments": [ 
  
              { 
  
                "sequence": "10", 
  
                "adjustmentId": "A2", 
  
                "adjustmentType": "Increase Mixing Time", 
  
                "reason": "RPM dropped below tolerance due to machine issues.", 
  
                "impactOnProcess": "Increased mixing time by 10 minutes." 
  
              } 
  
            ], 
  
            "ccp": true, 
  
            "criticalControlPoints": { 
  
              "ccpId": "C1", 
  
              "description": "Ensure that the Lasuna Bulbs are added with accurate weight using the scale.", 
  
              "criticalLimits": "1", 
  
              "monitoringFrequency": "At addition", 
  
              "correctiveAction": "Stop the process if weight is incorrect, recalibrate scale." 
  
            }, 
  
            "opIngredients": { 
  
              "active": [ 
  
                { 
  
                  "ingredientId": "ING003", 
  
                  "ingreDescription": "Operation Ingredient 1", 
  
                  "quantity": "2", 
  
                  "uom": "kg", 
  
                  "sequence": "10" 
  
                } 
  
              ], 
  
              "inactive": [ 
  
                { 
  
                  "ingredientId": "ING0033", 
  
                  "ingreDescription": "Operation Ingredient 21", 
  
                  "quantity": "2", 
  
                  "sequence": "10" 
  
                } 
  
              ] 
  
            } 
  
          }, 
  
          { 
  
            "operationId": "OPERATION_MIX_INGREDIENTS", 
  
            "operationDescription": "Mix Lasuna Bulbs and Cellulose Microcrystalline", 
  
            "sequence": "20", 
  
            "entryOperation": false, 
  
            "lastOperationAtPhase": false, 
  
            "nextOperations": "30", 
  
            "type": "sequential", 
  
            "instruction": "Mix Lasuna Bulbs and Cellulose Microcrystalline at 150 RPM for 50 minutes.", 
  
            "expectedCycleTime": "50", 
  
            "resources": [ 
  
              { 
  
                "sequence": "10", 
  
                "resourceId": "BLENDI02", 
  
                "description": "Blending Machine", 
  
                "workCenterId": "WC_BLENDING", 
  
                "parameters": { 
  
                  "rpm": 150, 
  
                  "duration": "50" 
  
                } 
  
              } 
  
            ], 
  
            "dataCollection": [ 
  
              { 
  
                "sequence": "10", 
  
                "dataPointId": "DC_RPM", 
  
                "description": "Record RPM during the mixing process", 
  
                "frequency": "Every 10 min", 
  
                "expectedValueRange": "150 ± 5" 
  
              }, 
  
              { 
  
                "sequence": "20", 
  
                "dataPointId": "DC_TEMPERATURE", 
  
                "description": "Monitor temperature during mixing", 
  
                "frequency": "Continuous", 
  
                "expectedValueRange": "20-30°C" 
  
              } 
  
            ], 
  
            "qcParameters": { 
  
              "sequence": "10", 
  
              "qcId": "QC_HOMOGENEITY", 
  
              "qcDescription": "abc", 
  
              "parameter": "Homogeneity", 
  
              "expectedValue": "95", 
  
              "monitoringFrequency": "End of Step", 
  
              "toolsRequired": [ 
  
                "Spectrometer" 
  
              ], 
  
              "actionsOnFailure": "Repeat mixing process." 
  
            }, 
  
            "byProducts": [ 
  
              { 
  
                "sequence": "10", 
  
                "byProductId": "BYPRODUCT_DUST", 
  
                "description": "Dust collected from the mixing process", 
  
                "expectedQuantity": "33", 
  
                "uom": "KG", 
  
                "handlingProcedure": "Dispose as per safety protocols." 
  
              } 
  
            ] 
  
          }, 
  
          { 
  
            "operationId": "OPERATION_3", 
  
            "operationDescription": "Add Lasuna Bulbs", 
  
            "sequence": "30", 
  
            "entryOperation": false, 
  
            "lastOperationAtPhase": true, 
  
            "nextOperations": "00", 
  
            "type": "sequential", 
  
            "instruction": "Add 150 KG of Lasuna Bulbs into the sifting machine.", 
  
            "expectedCycleTime": "10", 
  
            "tools": [ 
  
              "scale", 
  
              "sifterA" 
  
            ], 
  
            "resources": [ 
  
              { 
  
                "sequence": "10", 
  
                "resourceId": "R1", 
  
                "description": "Blending Machine", 
  
                "workCenterId": "WC_BLENDING", 
  
                "parameters": { 
  
                  "rpm": 150, 
  
                  "duration": "10" 
  
                } 
  
              } 
  
            ], 
  
            "dataCollection": [ 
  
              { 
  
                "sequence": "10", 
  
                "dataPointId": "D8", 
  
                "description": "abc", 
  
                "parameter": "RPM", 
  
                "expectedValue": "150", 
  
                "allowedVariance": "5", 
  
                "monitoringFrequency": "continuous" 
  
              } 
  
            ], 
  
            "qcParameters": { 
  
              "sequence": "10", 
  
              "qcId": "QC1", 
  
              "qcDescription": "abc", 
  
              "parameter": "Purity", 
  
              "expectedValue": "98", 
  
              "monitoringFrequency": "end of step", 
  
              "toolsRequired": [ 
  
                "Spectrometer" 
  
              ], 
  
              "actionsOnFailure": "Repeat process until 98% purity is achieved." 
  
            }, 
  
            "adjustments": [ 
  
              { 
  
                "sequence": "10", 
  
                "adjustmentId": "A2", 
  
                "adjustmentType": "Increase Mixing Time", 
  
                "reason": "RPM dropped below tolerance due to machine issues.", 
  
                "impactOnProcess": "Increased mixing time by 10 minutes." 
  
              } 
  
            ], 
  
            "ccp": true, 
  
            "criticalControlPoints": { 
  
              "ccpId": "C1", 
  
              "description": "Ensure that the Lasuna Bulbs are added with accurate weight using the scale.", 
  
              "criticalLimits": "1", 
  
              "monitoringFrequency": "At addition", 
  
              "correctiveAction": "Stop the process if weight is incorrect, recalibrate scale." 
  
            }, 
  
            "opIngredients": { 
  
              "active": [ 
  
                { 
  
                  "ingredientId": "ING003", 
  
                  "ingreDescription": "Operation Ingredient 1", 
  
                  "quantity": "2", 
  
                  "uom": "kg", 
  
                  "sequence": "10" 
  
                } 
  
              ], 
  
              "inactive": [ 
  
                { 
  
                  "ingredientId": "ING0033", 
  
                  "ingreDescription": "Operation Ingredient 21", 
  
                  "quantity": "2", 
  
                  "sequence": "10" 
  
                } 
  
              ] 
  
            } 
  
          } 
  
        ] 
  
      }, 
  
      { 
  
        "phaseId": "PHASE_TABLET_COMPRESSION", 
  
        "phaseDescription": "Tablet Compression", 
  
        "sequence": "20", 
  
        "entryPhase": false, 
  
        "exitPhase": false, 
  
        "nextPhase": "30", 
  
        "expectedCycleTime": "120", 
  
        "ingredients": { 
  
          "active": [ 
  
            { 
  
              "ingredientId": "ING001", 
  
              "ingreDescription": "Active Ingredient 1", 
  
              "quantity": "10", 
  
              "uom": "kg", 
  
              "sequence": "10", 
  
              "materialDescription": "High-quality material", 
  
              "storageLocation": "Warehouse A", 
  
              "tolerance": "5%", 
  
              "materialType": "Type A", 
  
              "supplierId": "SUP001", 
  
              "sourceLocation": "Factory 1", 
  
              "qcParameters": [ 
  
                {} 
  
              ], 
  
              "handlingInstructions": "Handle with care", 
  
              "storageInstructions": "Keep in a cool, dry place", 
  
              "unitCost": "100", 
  
              "currency": "USD", 
  
              "totalCost": "1000", 
  
              "wasteQuantity": "1", 
  
              "wasteUoM": "kg", 
  
              "batchNumber": "B001", 
  
              "byProduct": { 
  
                "byProductId": "BP001" 
  
              }, 
  
              "hazardous": false, 
  
              "alternateIngredients": [ 
  
                { 
  
                  "ingredientId": "ALT001", 
  
                  "quantity": 0 
  
                } 
  
              ], 
  
              "expiryDate":  "2025-12-29T18:30:00.000Z" , 
  
              "manufactureDate":  "2024-05-30T18:30:00.000Z" 
  
              
  
            } 
  
          ], 
  
          "inactive": [ 
  
            { 
  
              "ingredientId": "ING002", 
  
              "ingreDescription": "Inactive Ingredient 1", 
  
              "quantity": "5", 
  
              "uom": "liters", 
  
              "sequence": "10", 
  
              "materialDescription": "Inactive material", 
  
              "storageLocation": "Warehouse B", 
  
              "tolerance": "10%", 
  
              "materialType": "Type B", 
  
              "supplierId": "SUP002", 
  
              "sourceLocation": "Factory 2", 
  
              "qcParameters": [], 
  
              "handlingInstructions": "Store separately", 
  
              "storageInstructions": "Protect from sunlight", 
  
              "unitCost": "50", 
  
              "currency": "USD", 
  
              "totalCost": "250", 
  
              "wasteQuantity": "0.5", 
  
              "wasteUoM": "liters", 
  
              "batchNumber": "B002", 
  
              "hazardous": false, 
  
              "alternateIngredients": [], 
  
              "expiryDate":  "2025-12-29T18:30:00.000Z" , 
  
              "manufactureDate":  "2024-05-30T18:30:00.000Z" 
  
              
  
            } 
  
          ] 
  
        }, 
  
        "operations": [ 
  
          { 
  
            "operationId": "OPERATION_COMPRESSION", 
  
            "operationDescription": "abc", 
  
            "sequence": "10", 
  
            "entryOperation": true, 
  
            "lastOperationAtPhase": true, 
  
            "nextOperations": "00", 
  
            "type": "sequential", 
  
            "instruction": "Compress the mixture of ingredients into 600,000 tablets.", 
  
            "expectedCycleTime": "120", 
  
            "resources": [ 
  
              { 
  
                "sequence": "10", 
  
                "resourceId": "TABCOM02", 
  
                "description": "abc", 
  
                "parameters": { 
  
                  "rpm": 50, 
  
                  "duration": "120 min", 
  
                  "pressure": "30 KN" 
  
                } 
  
              } 
  
            ], 
  
            "dataCollection": [ 
  
              { 
  
                "sequence": "10", 
  
                "dataPointId": "DC_PRESSURE", 
  
                "description": "Record compression pressure", 
  
                "frequency": "Every 15 min", 
  
                "expectedValueRange": "30 KN ± 5 KN" 
  
              }, 
  
              { 
  
                "sequence": "20", 
  
                "dataPointId": "DC_TABLET_SIZE", 
  
                "description": "Measure the size of the tablet", 
  
                "frequency": "Every 30 min", 
  
                "expectedValueRange": "Diameter 10mm ± 0.5mm" 
  
              } 
  
            ], 
  
            "qcParameters": { 
  
              "sequence": "10", 
  
              "qcId": "QC_TABLET_WEIGHT", 
  
              "qcDescription": "abc", 
  
              "parameter": "Tablet Weight", 
  
              "expectedValue": "500", 
  
              "monitoringFrequency": "Every 30 min", 
  
              "actionsOnFailure": "Adjust the compression machine settings." 
  
            } 
  
          } 
  
        ] 
  
      }, 
  
      { 
  
        "phaseId": "PHASE_MIXING", 
  
        "phaseDescription": "Mixing and Heating", 
  
        "sequence": "30", 
  
        "entryPhase": false, 
  
        "exitPhase": true, 
  
        "nextPhase": "00", 
  
        "expectedCycleTime": "40 min", 
  
        "operations": [ 
  
          { 
  
            "operationId": "OPERATION_MIX", 
  
            "operationDescription": "Mix Ingredients", 
  
            "sequence": "10", 
  
            "entryOperation": true, 
  
            "lastOperationAtPhase": false, 
  
            "nextOperations": "20", 
  
            "type": "sequential", 
  
            "instruction": "Mix at 150 RPM for 20 minutes.", 
  
            "expectedCycleTime": "20 min", 
  
            "dataCollection": [ 
  
              { 
  
                "sequence": "10", 
  
                "dataPointId": "dc_2", 
  
                "description": "abc", 
  
                "parameter": "RPM", 
  
                "expectedValue": "150", 
  
                "allowedVariance": "±5 RPM", 
  
                "monitoringFrequency": "continuous" 
  
              } 
  
            ], 
  
            "ccp": true 
  
          } 
  
        ] 
  
      } 
  
    ], 

  
  
    "status": "RELEASABLE", 
  
  } 

  const response = await api.post('/recipe-service/createOrUpdate', {site,...recipeData});
  // const response = await api.post('/recipe-service/createOrUpdate', param);
  
  return response.data;
};

export const updateRecipe = async (recipeData) => {
  console.log(recipeData,"routingData");
  const response = await api.post('/recipe-service/createOrUpdate', recipeData);
  return response.data;
};


export const retrieveRouting = async (site: string,recipeName, recipeId: string, user: string,version) => {
  console.log(site,user,recipeId,version,"check");
  
  const sample = {
    recipeId,user,version,recipeName
  };
const response = await api.post('/recipe-service/getRecipe',  {site,...sample});
  console.log(response.data,sample, 'Routing retrieve Response');
  
  return response.data.response;
};


export const deleteRecipe = async (site: string, version: string, recipeId: string, user: string,recipeName:string) => {
  const params = {
    site,
    version,
    recipeId,
    user,
    recipeName
  };
  console.log(params,"Delete");
  const response = await api.post('/recipe-service/delete', params );
  console.log(response,"Delete");
  
  return response.data;
};



export const retrieveAllWC = async (site: string, workCenter: string) => {
  const response = await api.post('/workcenter-service/retrieveAll', { site, workCenter });
  // console.log(response,'work center List Response');
  
  return response.data.workCenterList;
};

export const retrieveTop50WC = async (site: string) => {
  const response = await api.post('/workcenter-service/retrieveTop50', { site });
  // console.log(response,'work center List Response');
  
  return response.data.workCenterList;
};

export const retrieveErpWC = async (site: string) => {
  const response = await api.post('/workcenter-service/getErpWorkCenterList', { site });
  // console.log(response,'ERP work center List Response');
  
  return response.data.workCenterList;
};

export const updatePhase = async (site: string, params: object) => {
  console.log(params,"phasesen");
  
  const response = await api.put('/recipe-service/updatePhase', { site, ...params });
   console.log(response,'Custom Data List Response');
  
  return response.data;
};
export const addPhase = async (site: string, params: object) => {
  console.log(params,"phasesenl");
  
  const response = await api.post('/recipe-service/addPhases', { site, ...params });
   console.log(response,'Custom Data List Response');
  
  return response.data;
};

export const getPhaseIngredients = async (site: string, params: object) => {
  console.log(params,"phasesen");
  
  const response = await api.post('/recipe-service/getPhaseIngredients', {site,...params});
   console.log(response,'Custom Data List Responsse');
  
  return response.data;
};
export const getNextphase = async (site: string, params: object) => {
    console.log(params,"phasesen");
    
    const response = await api.post('/recipe-service/getNextphase', {site,...params});
     console.log(response,'Custom Data List Responsse');
    
    return response.data;
  };

export const addPhaseIngredient = async (site: string, params: object) => {
  console.log(params,site,"phasesen");

  console.log(site,params ,'Custom Data List Response');
  const response = await api.post('/recipe-service/addPhaseIngredient', {site,...params });
   console.log(site,params ,'Custom Data List Response');
  
  return response.data;
};

export const updatePhaseIngredient = async (site: string, params: object) => {
  console.log(params,site,"phasesen");

  
  const response = await api.post('/recipe-service/updatePhaseIngredient', {site,...params });
   console.log(response,'Custom Data List Response');
  
  return response.data;
};

export const deletePhaseStep  = async (site: string, params: object) => {
  console.log(params,site,"phasesen");

  
  const response = await api.post('/recipe-service/deletePhaseOperation ', { site, ...params });
   console.log(response,'Custom Data List Response');
  
  return response.data;
};
export const deletePhase  = async (site: string, params: object) => {
    console.log(params,site,"phasesen");
  
    
    const response = await api.post('/recipe-service/deletePhase ', { site, ...params });
     console.log(response,'Custom Data List Response');
    
    return response.data;
  };

  export const addIngredients  = async ( params: object) => {
    console.log(params,"addIngredients");
  
    
    const response = await api.post('/recipe-service/addIngredients', params );
     console.log(response,'Custom Data List Response');
    
    return response.data;
  };
  export const updateIngredient  = async ( params: object) => {
    console.log(params,"addIngredients");
  
    
    const response = await api.put('/recipe-service/updateIngredient ', params );
     console.log(response,'Custom Data List Response');
    
    return response.data;
  };
  export const deleteIngredient  = async (site, params: object) => {
    console.log(params,"addIngredients");
  
    
    const response = await api.post('/recipe-service/deleteIngredient ', {site,...params} );
     console.log(response,'Custom Data List Response');
    
    return response.data;
  };
  
  export const deletePhaseIngredient  = async ( params: object) => {
    console.log(params,"addIngredients");
  
    
    const response = await api.post('/recipe-service/deletePhaseIngredient ', params );
     console.log(response,'Custom Data List Response');
    
    return response.data;
  };
  