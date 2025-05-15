type TitleAlign = 'left' | 'center' | 'right';

interface StyleProps {
    heading: {
        titleAlign: TitleAlign;
    };
    form?: {
        column: number;
    };
    table?: {
        column?: number;
    };
}

export const TEMPLATE_TYPES = [
    {
        label: 'Master Formula Record (MFR)',
        value: 'MFR',
    },
    {
        label: 'Batch Manifacturing Record (BMR)',
        value: 'BMR',
    },
    {
        label: 'eBMR',
        value: 'eBMR',
    },
];

export const PRODUCT_DETAILS_PROPS = {
    title: 'Product Details',
    type: 'form',
    metaData: [
        {
            dataIndex: 'productName',
            title: 'Product Name',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'dosageForm',
            title: 'Dosage Form',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'activeContent',
            title: 'Active content',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'primaryPack',
            title: 'Primary Pack',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'unitPack',
            title: 'Unit Pack',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'additionalBrandName',
            title: 'Additional Brand Name',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'nameAndAddressOfTheCompany',
            title: 'Name and address of the company',
            required: true,
            type: 'input'
        }

    ],
    data: [
        {
            dataIndex: 'productName',
            value: 'Baby Wash',
        },
        {
            dataIndex: 'dosageForm',
            value: 'Liquid',
        },
        {
            dataIndex: 'activeContent',
            value: '5.0 mg/g',
        },
        {
            dataIndex: 'primaryPack',
            value: 'As per Annexure 01',
        },
        {
            dataIndex: 'unitPack',
            value: 'As per Annexure 01',
        },
        {
            dataIndex: 'additionalBrandName',
            value: 'As per Annexure 02',
        },
        {
            dataIndex: 'nameAndAddressOfTheCompany',
            value: 'Himalaya Wellness Company',
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 1
        }
    }
};

// export const BILL_OF_MATERIAL_PROPS = {
//     title: 'Bill Of Material',
//     type: 'table',
//     metaData:[
//         {
//             dataIndex: 'S. No.',
//             title: 'S. No.'
//         },
//         {
//             dataIndex: 'Material Code',
//             title: 'Material Code'
//         },
//         {
//             dataIndex: 'Material Description',  
//             title: 'Material Description'
//         },
//         {
//             dataIndex: 'Grade',
//             title: 'Grade'
//         },
//         {
//             dataIndex: 'INCI Name',
//             title: 'INCI Name'
//         },
//         {
//             dataIndex: 'Function',
//             title: 'Function'
//         },
//         {
//             dataIndex: 'CAS NO.',
//             title: 'CAS NO.'
//         },
//         {
//             dataIndex: 'UOM',
//             title: 'UOM',
//         },
//         {
//             dataIndex: 'ADDN',
//             title: 'ADDN'
//         },
//         {
//             dataIndex: 'Qty Per Batch',
//             title: 'Qty Per Batch'
//         },
//         {
//             dataIndex: 'Qty per g in mg',
//             title: 'Qty per g in mg'
//         },
//         {
//             dataIndex: 'active',
//             title: 'Active'
//         }
//     ],
//     data: [],
//     style: {
//         heading: {
//             titleAlign: 'center' as TitleAlign
//         },
//         table: {}
//     }
// };

export const BILL_OF_MATERIAL_PROPS = {
    title: 'Bill Of Material',
    type: 'table',
    metaData: [
        {
            dataIndex: 'S. No.',
            title: 'S. No.'
        },
        {
            dataIndex: 'Material Code',
            title: 'Material Code'
        },
        {
            dataIndex: 'Material Description',
            title: 'Material Description'
        },
        {
            dataIndex: 'Grade',
            title: 'Grade'
        },
        {
            dataIndex: 'INCI Name',
            title: 'INCI Name'
        },
        {
            dataIndex: 'Function',
            title: 'Function'
        },
        {
            dataIndex: 'CAS NO.',
            title: 'CAS NO.'
        },
        {
            dataIndex: 'UOM',
            title: 'UOM',
        },
        {
            dataIndex: 'ADDN',
            title: 'ADDN'
        },
        {
            dataIndex: 'Qty Per Batch',
            title: 'Qty Per Batch'
        },
        {
            dataIndex: 'Qty per g in mg',
            title: 'Qty per g in mg'
        },
        {
            dataIndex: 'active',
            title: 'Active'
        }
    ],
    data: [
        {
            "S. No.": 1,
            "Material Code": "MC001",
            "Material Description": "Glyceryl Stearate",
            "Grade": "Pharma",
            "INCI Name": "Glyceryl Stearate",
            "Function": "Emulsifier",
            "CAS NO.": "11099-07-3",
            "UOM": "mg",
            "ADDN": "0.50",
            "Qty Per Batch": "500g",
            "Qty per g in mg": "50mg",
            "active": "Active"
        },
        {
            "S. No.": 2,
            "Material Code": "MC002",
            "Material Description": "Cetyl Alcohol",
            "Grade": "Cosmetic",
            "INCI Name": "Cetyl Alcohol",
            "Function": "Thickener",
            "CAS NO.": "36653-82-4",
            "UOM": "kg",
            "ADDN": "0.50",
            "Qty Per Batch": "300g",
            "Qty per g in mg": "30mg",
            "active": "InActive"
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {}
    }
};

export const MASTER_FORMULA_RECORD_PROPS = {
    title: 'Master Formula Record',
    type: 'form',
    metaData: [
        {
            dataIndex: 'productName',
            title: 'Product Name',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'mfrNo',
            title: 'MFR No.',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'version',
            title: 'Version',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'supersedes',
            title: 'Supersedes',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'batchSize',
            title: 'Batch Size',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'shelfLife',
            title: 'Shelf Life',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'mfgLicCategory',
            title: 'Mfg. Lic. Category',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'effectiveDate',
            title: 'Effective Date',
            required: true,
            type: 'date'
        }
    ],
    data: [
        {
            dataIndex: 'productName',
            value: 'Baby Wash',
        },
        {
            dataIndex: 'mfrNo',
            value: 'MFR/PC/0379',
        },
        {
            dataIndex: 'version',
            value: '00',
        },
        {
            dataIndex: 'supersedes',
            value: 'NA',
        },
        {
            dataIndex: 'batchSize',
            value: '100kg',
        },
        {
            dataIndex: 'shelfLife',
            value: '3 years',
        },
        {
            dataIndex: 'mfgLicCategory',
            value: 'FDA',
        },
        {
            dataIndex: 'effectiveDate',
            value: '',
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 2
        }
    }
};

export const APPROVED_BY_PROPS = {
    title: 'Approved By',
    type: 'table',
    metaData: [
        {
            dataIndex: 'Prepared By',
            title: 'Prepared By'
        },
        {
            dataIndex: 'Reviewed & Approved By 1',
            title: 'Reviewed & Approved By 1'
        },
        {
            dataIndex: 'Reviewed & Approved By 2',
            title: 'Reviewed & Approved By 2'
        },
        {
            dataIndex: 'Reviewed & Approved By 3',
            title: 'Reviewed & Approved By 3'
        }
    ],
    data: [
        {
            "Prepared By": "CDC",
            "Reviewed & Approved By 1": "F&D-PC",
            "Reviewed & Approved By 2": "R&D-TT",
            "Reviewed & Approved By 3": "R&D-QA"
        },
        {
            "Prepared By": "Shrikrishna Hasnale \n Research Associate",
            "Reviewed & Approved By 1": "Nagaveni K.S - Senior Research Associate",
            "Reviewed & Approved By 2": "Manoj Kumar - Associate Manager",
            "Reviewed & Approved By 3": " Ganesh Uravane - Research Associate"
        },
        {
            "Prepared By": "17/01/2024",
            "Reviewed & Approved By 1": "17/01/2024",
            "Reviewed & Approved By 2": "17/01/2024",
            "Reviewed & Approved By 3": "17/01/2024"
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
};

// export const MANUFACTURING_PROCEDURE_PROPS = {
//     title: "Manufacturing Instructions",
//     type: 'section',
//     data:[] ,
//     style: {
//         heading: {
//             titleAlign: 'left' as TitleAlign
//         }
//     }
// };

export const MANUFACTURING_PROCEDURE_PROPS = {
    title: "Manufacturing Instructions",
    type: 'section',
    data:[
        {
            title: "Phase A:",
            dataIndex: '',
            placeholder: "Enter preparation instructions...",
            value: `Transfer the Purified Water (5.0%) to separate SS vessel and add Disodium EDTA (0.05 %) and mix well for 5
minutes to get clear solution and transfer to main mixing vessel through 100 # nylon filter cloth with anchor
speed at 35-40 rpm. Transfer remaining purified Water (56.46 %) into the main vessel under continuous
mixing at 35-40 RPM for 10 minutes. Start cowl/stirrer/homogenizer & add Carbopol Ultrez 20 (0.7 %) into
the vortex of the Purified Water. Disperse completely (No lumps should be present).
Observation: A translucent gel is formed`
        },
        {
            title: "Phase B:",
            placeholder: "Enter mixing instructions...",
            value: `In a separate SS vessel, dissolve Sodium Hydroxide Pellets (0.22 %) in Purified Water (2.00%) using SS Spatula
until clear solution obtained. Observation: A transparent solution is formed which has to be handled properly as the temperature increases
during the dissolution process.
Transfer it to the main vessel by passing through #100 nylon filter & continue mixing at 25-30rpm for 15 
mins.
Observation: A clear transparent thick gel is formed`
        },
        {
            title: "Phase C:",
            placeholder: "Enter quality control instructions...",
            value: `Transfer Disodium Cocoamphodiacetate [Miranol C2M Conc NP] (5.0 %) & Coco Glucoside [Plantacare 818 UP]
(10.0 %) into main vessel at 25-30rpm for 10 minutes under stirring. (ensure that no lumps are formed).
Observation: Transparent liquid`
        }
    ] ,
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        }
    }
};

export const GENERAL_DOS_AND_DONTS_PROPS = {
    title: 'General Dos and Donts',
    type: 'list',
    defaultVisible: true,
    data: [
        {
            title: 'General Dos and Donts',
            list: [
                'All ingredients should be weighed accurately as per the quantity mentioned in BOM.',
                'Use gloves & masks during production activity.',
                'Ensure that all vessels are clean, dry & odour free.',

            ]
        },
        {
            title: 'Critical Control Points',
            list: [
                'Disperse Carbomer [Carbopol 980] with cowl/stirrer/homogenizer in main vessel. Ensure no lumps should be present.',
                'Dissolution of Sodium Hydroxide Pellets in Purified Water liberates heat; care should be taken while handling it.',
            ]
        }
    ],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        }
    }
};

// export const BRIEF_MANUFACTURING_PROPS = {
//     title: 'Brief Manufacturing And Packing Procedure',
//     type: 'table',
//     metaData: [
//         {
//             title: 'Phase',
//             dataIndex: 'phase',
//             width: '10%'
//         },
//         {
//             title: 'Name of the Raw Material',
//             dataIndex: 'name',
//             width: '65%'
//         },
//         {
//             title: '% ADDN (W/W)',
//             dataIndex: 'percent',
//             width: '25%'
//         }
//     ],
//     data: [],
//     style: {
//         heading: {
//             titleAlign: 'center' as TitleAlign
//         }
//     }
// };

export const BRIEF_MANUFACTURING_PROPS = {
    title: 'Brief Manufacturing And Packing Procedure',
    type: 'table',
    metaData: [
        {
            title: 'Phase',
            dataIndex: 'phase',
            width: '10%'
        },
        {
            title: 'Name of the Raw Material',
            dataIndex: 'name',
            width: '65%'
        },
        {
            title: '% ADDN (W/W)',
            dataIndex: 'percent',
            width: '25%'
        }
    ],
    data: [
        {
            key: 'A',
            phase: 'A',
            name: 'Purified Water',
            percent: '5.00',
            children: [
                {
                    key: 'A1',
                    phase: '',
                    name: 'Disodium EDTA',
                    percent: '56.46',
                },
            ],
        },
        {
            key: 'A1',
            phase: 'A1',
            name: 'Purified Water',
            percent: '5.00',
            children: [
                {
                    key: 'A1.1',
                    phase: '',
                    name: 'Acrylates C 10-30 Alkyl Acrylate Crosspolymer [Carbopol 20]',
                    percent: '0.70',
                },
            ],
        },
        {
            key: 'B',
            phase: 'B',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'B1',
                    phase: '',
                    name: 'Sodium Hydroxide pellets',
                    percent: '0.22',
                },
            ],
        },
        {
            key: 'C',
            phase: 'C',
            name: 'Disodium Cocoamphodiacetate [Miranol C2M Conc NP]',
            percent: '5.00',
            children: [
                {
                    key: 'C1',
                    phase: '',
                    name: 'Coco Glucoside [Plantacare 818 UP]',
                    percent: '10.00',
                },
            ],
        },
        {
            key: 'D',
            phase: 'D',
            name: 'Cocamido Propyl Betaine [Galaxy]',
            percent: '8.00',
        },
        {
            key: 'E',
            phase: 'E',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'E1',
                    phase: '',
                    name: 'BG 361 (PBF) Soft Extract',
                    percent: '0.50',
                },
            ],
        },
        {
            key: 'F',
            phase: 'F',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'F1',
                    phase: '',
                    name: 'Potassium Sorbate',
                    percent: '0.20',
                },
            ],
        },
        {
            key: 'G',
            phase: 'G',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'G1',
                    phase: '',
                    name: 'Sodium Benzoate',
                    percent: '0.30',
                },
            ],
        },
        {
            key: 'H',
            phase: 'H',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'H1',
                    phase: '',
                    name: 'Citric Acid / Citric Acid Monohydrate',
                    percent: '0.35',
                },
            ],
        },
        {
            key: 'I',
            phase: 'I',
            name: 'Purified Water',
            percent: '2.00',
            children: [
                {
                    key: 'I1',
                    phase: '',
                    name: 'Sodium Citrate',
                    percent: '0.20',
                },
            ],
        },
        {
            key: 'J',
            phase: 'J',
            name: 'Phenoxyethanol',
            percent: '0.50',
        },
        {
            key: 'K',
            phase: 'K',
            name: 'Perfume Sweet Love 288570',
            percent: '0.70',
        },
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        }
    }
};

export const ACTIVE_COMPOSITION_PROPS = {
    title: 'Active Composition',
    type: 'table',
    metaData: [
        {
            dataIndex: 'S. No',
            title: 'S. No'
        },
        {
            dataIndex: 'Active Preparation',
            title: 'Active Preparation'
        },
        {
            dataIndex: 'Common Name',
            title: 'Common Name'
        },
        {
            dataIndex: 'INCI Name',
            title: 'INCI Name'
        },
        {
            dataIndex: 'Part Used',
            title: 'Part Used'
        },
        {
            dataIndex: 'Quantity(mg)',
            title: 'Quantity(mg)'
        },
        {
            dataIndex: 'Functions',
            title: 'Functions'
        }

    ],
    data: [
        {
            "S. No": 1,
            "Active Preparation": "Extract",
            "Common Name": "chickpea",
            "INCI Name": "Cicer Arietinum Seed Extract",
            "Part Used": "Seed",
            "Quantity(mg)": "2.5",
            "Functions": "Skin Conditioning"
        },
        {
            "S. No": 2,
            "Active Preparation": "Extract",
            "Common Name": "mung bean",
            "INCI Name": "Phaseolus Radiatus Seed Extract",
            "Part Used": "Seed",
            "Quantity(mg)": "1.5",
            "Functions": "Skin Conditioning"
        },
        {
            "S. No": 3,
            "Active Preparation": "Extract",
            "Common Name": "fenugreek",
            "INCI Name": "Trigonella Foenum-Graecum Seed Extract",
            "Part Used": "Seed",
            "Quantity(mg)": "1.0",
            "Functions": "Moisturization, Skin Conditioning"
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
};

export const ABBREVIATIONS_PROPS = {
    title: 'Abbreviations',
    type: 'form',
    defaultVisible: true,
    metaData: [
        {
            dataIndex: 'alt',
            title: 'Alt',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'addn',
            title: 'ADDN',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'bom',
            title: 'BOM',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'cas',
            title: 'CAS',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'cm',
            title: 'CM',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'cp',
            title: 'CP',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'edta',
            title: 'EDTA',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ext',
            title: 'Ext',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'g',
            title: 'G',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'hdpe',
            title: 'HDPE',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ih',
            title: 'IH',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'inci',
            title: 'INCI',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ip',
            title: 'IP',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'kg',
            title: 'Kg',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'l',
            title: 'L',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'mc',
            title: 'MC',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'mfr',
            title: 'MFR',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'mg',
            title: 'mg',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ml',
            title: 'ml',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'min',
            title: 'min',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'pet',
            title: 'PET',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'pdr',
            title: 'PDR',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'pbf',
            title: 'PBF',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ph_eur',
            title: 'Ph.Eur',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'pc',
            title: 'PC',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'qa',
            title: 'QA',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'qty',
            title: 'Qty',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'qc',
            title: 'QC',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'rpm',
            title: 'RPM',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 's_no',
            title: 'S.',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'se',
            title: 'SE',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'ss',
            title: 'SS',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'uom',
            title: 'UOM',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'usp',
            title: 'USP',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'vol',
            title: 'Vol.',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'mfg_lic',
            title: 'Mfg. Lic.',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'deg_c',
            title: '0C',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'percent',
            title: '%',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'and',
            title: '&',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'w_w',
            title: 'w/w',
            required: true,
            type: 'text'
        },
        {
            dataIndex: 'mesh_size',
            title: '#',
            required: true,
            type: 'text'
        }
    ],
    data: [
        {
            dataIndex: 'alt',
            value: "Alternate No.",
        },
        {
            dataIndex: 'addn',
            value: "Addition",
        },
        {
            dataIndex: 'bom',
            value: "Bill Of Material",
        },
        {
            dataIndex: 'cas',
            value: "Chemical Abstract Service",
        },
        {
            dataIndex: 'cm',
            value: "Centimetre",
        },
        {
            dataIndex: 'cp',
            value: "Consumer Products",
        },
        {
            dataIndex: 'edta',
            value: "Ethylene Diamino Tetra Acetic Acid",
        },
        {
            dataIndex: 'ext',
            value: "Extract",
        },
        {
            dataIndex: 'g',
            value: "Gram",
        },
        {
            dataIndex: 'hdpe',
            value: "High-Density PolyEthylene",
        },
        {
            dataIndex: 'ih',
            value: "In-House",
        },
        {
            dataIndex: 'inci',
            value: "International Nomenclature of Cosmetic Ingredients",
        },
        {
            dataIndex: 'ip',
            value: "Indian Pharmacopoeia",
        },
        {
            dataIndex: 'kg',
            value: "Kilogram",
        },
        {
            dataIndex: 'l',
            value: "Litre",
        },
        {
            dataIndex: 'mc',
            value: "Micro Controlled",
        },
        {
            dataIndex: 'mfr',
            value: "Master Formula Record",
        },
        {
            dataIndex: 'mg',
            value: "Milligram",
        },
        {
            dataIndex: 'ml',
            value: "Millilitre",
        },
        {
            dataIndex: 'min',
            value: "Minutes",
        },
        {
            dataIndex: 'pet',
            value: "Poly Ethylene Terephthalate",
        },
        {
            dataIndex: 'pdr',
            value: "Powder",
        },
        {
            dataIndex: 'pbf',
            value: "Paraben Free",
        },
        {
            dataIndex: 'ph_eur',
            value: "European Pharmacopoeia",
        },
        {
            dataIndex: 'pc',
            value: "Personal Care",
        },
        {
            dataIndex: 'qa',
            value: "Quality Assurance",
        },
        {
            dataIndex: 'qty',
            value: "Quantity",
        },
        {
            dataIndex: 'qc',
            value: "Quality Control",
        },
        {
            dataIndex: 'rpm',
            value: "Rotation Per Minute",
        },
        {
            dataIndex: 's_no',
            value: "Serial",
        },
        {
            dataIndex: 'se',
            value: "Soft Extract",
        },
        {
            dataIndex: 'ss',
            value: "Stainless Steel",
        },
        {
            dataIndex: 'uom',
            value: "Unit of Measurement",
        },
        {
            dataIndex: 'usp',
            value: "United States Pharmacopeia",
        },
        {
            dataIndex: 'vol',
            value: "Volume",
        },
        {
            dataIndex: 'mfg_lic',
            value: "Manufacturing Licence",
        },
        {
            dataIndex: 'deg_c',
            value: "Degree Celsius",
        },
        {
            dataIndex: 'percent',
            value: "Percentage",
        },
        {
            dataIndex: 'and',
            value: "And",
        },
        {
            dataIndex: 'w_w',
            value: "Weight by Weight",
        },
        {
            dataIndex: 'mesh_size',
            value: "Mesh Size",
        }
    ],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        },
        form: {
            column: 2
        }
    }
};


//BMR//

export const BATCH_MANUFACTURING_RECORD_PROPS = {
    title: 'Batch Manufacturing Record',
    type: 'form',
    metaData: [
        {
            dataIndex: 'productName',
            title: 'Product Name',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'documentNo',
            title: 'Document No.',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'supersedes',
            title: 'Supersedes Doc. No. & Date',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'market',
            title: 'Market',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'cml',
            title: 'CML',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'effectiveDate',
            title: 'Effective Date',
            required: true,
            type: 'date'
        },
        {
            dataIndex: 'batchSize',
            title: 'Standard Batch Size',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'batchNo',
            title: 'Batch No.',
            required: true,
            type: 'input'
        },
        {
            dataIndex: 'mfgLicCategory',
            title: 'Mfg. Lic. No.',
            required: true,
            type: 'input'
        }
    ],
    data: [
        {
            dataIndex: 'productName',
            value: 'PILEX FORTE OINTMENT GEN',
        },
        {
            dataIndex: 'documentNo',
            value: 'BMR/3000719/1136/02-00',
        },
        {
            dataIndex: 'supersedes',
            value: 'NIL',
        },
        {
            dataIndex: 'market',
            value: 'GEN 1',
        },
        {
            dataIndex: 'cml',
            value: 'YAACO PHARMA',
        },
        {
            dataIndex: 'effectiveDate',
            value: '2025-02-01',
        },
        {
            dataIndex: 'batchSize',
            value: '500KG',
        },
        {
            dataIndex: 'batchNo',
            value: '',
        },
        {
            dataIndex: 'mfgLicCategory',
            value: '',
        }

    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 2
        }
    }
}

export const APPROVED_BY_BMR_PROPS = {
    title: 'Approved By',
    type: 'table',
    metaData: [
        {
            dataIndex: 'Prepared By QA',
            title: 'Prepared By QA',
        },
        {
            dataIndex: 'Checked by Production',
            title: 'Checked by Production',
        },
        {
            dataIndex: 'Authorized by QA',
            title: 'Authorized by QA',
        }
    ],
    data: [
        {
            "Prepared By QA": " MALLARAJE URS A.N",
            "Checked by Production": "Eswarappa R",
            "Authorized by QA": "Kumarswamy D. Karki",
        },
        {
            "Prepared By QA": "14/12/2022",
            "Checked by Production": "14/12/2022",
            "Authorized by QA": "14/12/2022",
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
};


export const PRODUCT_DETAILS_BMR_PROPS = {
    title: 'Product Details',
    type: 'form',
    metaData: [
        {
            dataIndex: 'productName',
            title: 'Product Name',
        },
        {
            dataIndex: 'productCode',
            title: 'Semi Finished Product Code/Alternate No.',
        },
        {
            dataIndex: 'referenceMfrNo',
            title: 'Reference MFR No.',
        },
        {
            dataIndex: 'batchNumber',
            title: 'Batch Number',
        },
        {
            dataIndex: 'actualBatchSize',
            title: 'Actual Batch Size',
        },
        {
            dataIndex: 'manufacturingDate',
            title: 'Manufacturing Date',
        },
        {
            dataIndex: 'expiryDate',
            title: 'Expiry Date',
        },
        {
            dataIndex: 'shelfLife',
            title: 'Shelf Life',
        },
        {
            dataIndex: 'batchCommencedOn',
            title: 'Batch Commenced On',
        },
        {
            dataIndex: 'batchCompletedOn',
            title: 'Batch Completed On',
        },
        {
            dataIndex: 'totalQuantity',
            title: 'Total Quantity',
        },
        {
            dataIndex: 'manufacturingYield',
            title: 'Manufacturing Yield',
        },
        {
            dataIndex: 'deviationOrIncident',
            title: 'Any Break Down / Deviation / Incident',
        },
        {
            dataIndex: 'reviewedByProduction',
            title: 'Executed Batch Record Reviewed By Manager (Production)',
        },
        {
            dataIndex: 'reviewedByQA',
            title: 'Executed Batch Record Reviewed By Manager (QA)',
        }
    ],
    data: [
        {
            dataIndex: "productName",
            value: "PILEX FORTE OINTMENT GEN",

        },
        {
            dataIndex: "productCode",
            value: "3003687/01",
        },
        {
            dataIndex: "referenceMfrNo",
            value: "MFR/PH/19/0039/00",
        },
        {
            dataIndex: "batchNumber",
            value: "",
        },
        {
            dataIndex: "actualBatchSize",
            value: "",
        },
        {
            dataIndex: "manufacturingDate",
            value: "",
        },
        {
            dataIndex: "expiryDate",
            value: "",
        },
        {
            dataIndex: "shelfLife",
            value: "3 Years",
        },
        {
            dataIndex: "batchCommencedOn",
            value: "",
        },
        {
            dataIndex: "batchCompletedOn",
            value: "",
        },
        {
            dataIndex: "totalQuantity",
            value: "",
        },
        {
            dataIndex: "manufacturingYield",
            value: "",
        },
        {
            dataIndex: "deviationOrIncident",
            value: "",
        },
        {
            dataIndex: "reviewedByProduction",
            value: "",
        },
        {
            dataIndex: "reviewedByQA",
            value: "",
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 1
        }
    }
};

//PROCESSING INSTRUCTIONS

// export const PROCESSING_INSTRUCTIONS_PROPS = {
//     title: 'Processing Instructions',
//     type: 'list',
//     data: [],
//     style: {
//         heading: {
//             titleAlign: 'left' as TitleAlign
//         }
//     }
// };

export const PROCESSING_INSTRUCTIONS_PROPS = {
    title: 'Processing Instructions',
    type: 'list',
    data: [
        {
            title: 'General processing instructions:',
            list: [
                'Standard operating procedures are unit operation based & current revision of SOPs shall be followed.',
                'Observe GMP requirements throughout the manufacturing process.',
                'Check & ensure that the balances are in calibrated state.',
                'Ensure that product is labeled at all applicable stages of manufacturing process.',
                'Ensure that all vessels are clean, dry & odour free. Ensure all equipments are cleaned as per SOP & affixed with cleaned status label.',
                'Avoid direct product contact.',
                'Ensure that secondary gowning of the respective areas is followed.',
                'Dispense raw materials as per SOP.',
                'Maintain temperature of the respective area as per requirement.',
                'Dispense ingredients in new double polythene covers / dedicated drums.',
                'All the ingredients should be weighed & verified accurately as per the approved process order of batch.',
                'Security sieving of applicable ingredients should be done before addition.',
            ]
        },
        {
            title: 'Critical control points:',
            list: [
                'Crosscheck the dispensed material against process order',
                'Melting temperature for waxes',
                'Filtration of molten phase',
                'Mixing duration & RPM',
                'Maintain required temperature condition at each stage',
                'Filtration: Mesh size, Mesh integrity',
                'Cooling temperature',
                'Hold time of bulk material'
            ],
        },
    ],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        }
    }
};


export const RAW_MATERIAL_INDENT_PROPS = {
    title: 'Raw Material Indent as Per SAP:',
    type: 'table',
    metaData: [
        {
            dataIndex: 'SAP CODE',
            title: 'SAP CODE',
        },
        {
            dataIndex: 'MATERIAL DESCRIPTION',
            title: 'MATERIAL DESCRIPTION',
        },
        {
            dataIndex: 'UOM',
            title: 'UOM',
        },
        {
            dataIndex: 'STD. BATCH QTY.',
            title: 'STD. BATCH QTY.',
        },
    ],
    data: [
        {
            "SAP CODE": 2000212,
            "MATERIAL DESCRIPTION": "DD 458WN SE IH",
            "UOM": "KG",
            "STD. BATCH QTY.": 295
        },
        {
            "SAP CODE": 2000209,
            "MATERIAL DESCRIPTION": "DD 458 POWDER IH",
            "UOM": "KG",
            "STD. BATCH QTY.": 159.167
        },
        {
            "SAP CODE": 4000539,
            "MATERIAL DESCRIPTION": "CAMPHOR BP",
            "UOM": "KG",
            "STD. BATCH QTY.": 22.5
        },
        {
            "SAP CODE": 4000674,
            "MATERIAL DESCRIPTION": "CETOMACROGOL 1000 [NOIGEN CS 1000] BP",
            "UOM": "KG",
            "STD. BATCH QTY.": 61.25
        },
        {
            "SAP CODE": 4000949,
            "MATERIAL DESCRIPTION": "YELLOW PETROLEUM JELLY IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 182.5
        },
        {
            "SAP CODE": 4000750,
            "MATERIAL DESCRIPTION": "HEAVY LIQUID PARAFFIN IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 121.667
        },
        {
            "SAP CODE": 4001197,
            "MATERIAL DESCRIPTION": "PROPYL PARABEN SODIUM IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 2.917
        },
        {
            "SAP CODE": 4001192,
            "MATERIAL DESCRIPTION": "METHYL PARABEN SODIUM IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 4.583
        },
        {
            "SAP CODE": 4000673,
            "MATERIAL DESCRIPTION": "CETO STEARYL ALCOHOL IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 165
        },
        {
            "SAP CODE": 4000848,
            "MATERIAL DESCRIPTION": "PROPYLENE GLYCOL IP",
            "UOM": "KG",
            "STD. BATCH QTY.": 305.417
        },
        {
            "SAP CODE": 4000851,
            "MATERIAL DESCRIPTION": "PURIFIED WATER IP/PH.EUR/USP/IH",
            "UOM": "KG",
            "STD. BATCH QTY.": 680
        },
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
    }
}

export const LINE_CLEARANCE_FOR_MANUFACTURING_PROPS = {
    title: 'Line Clearance For Manufacturing:',
    type: 'table',
    metaData: [
        {
            dataIndex: 'Equipment',
            title: 'Equipment',
        },
        {
            dataIndex: 'Equipment id',
            title: 'Equipment id',
        },
        {
            dataIndex: 'Capacity of equipments / vessels',
            title: 'Capacity of equipments / vessels',
        },
        {
            dataIndex: 'Previous product',
            title: 'Previous product',
        },
        {
            dataIndex: 'Previous batch no.',
            title: 'Previous batch no.',
        },
        {
            dataIndex: 'Cleaned by & cleaned on date',
            title: 'Cleaned by & cleaned on date',
        },
        {
            dataIndex: 'Cleaned as per SOP No.',
            title: 'Cleaned as per SOP No.',
        },
        {
            dataIndex: 'Checked by prod. / Date',
            title: 'Checked by prod. / Date',
        }
    ],
    data: [
        {
            "Equipment": "Weighing balance",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Melting kettle",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "SS Jacketed Vessel",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "SS vessels for dissolution",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Main mixing vessel",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Extraction vessel",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Homogenizer",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Stirrer",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "#100 Mesh Nylon Cloth",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "#60 Mesh",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "SS Transfer Pump & Hose Pipes",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        },
        {
            "Equipment": "Bulk holding SS vessel",
            "Equipment id": "",
            "Capacity of equipments / vessels": "",
            "Previous product": "",
            "Previous batch no.": "",
            "Cleaned by & cleaned on date": "",
            "Cleaned as per SOP No.": "",
            "Checked by prod. / Date": ""
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
    }
}

export const RAW_MATERIAL_DISPENSING_PROPS = {
    title: 'Raw Material Dispensing',
    type: 'tableWithForm',
    metaData: {
        form: [
            {
                dataIndex: 'dispensingBooth',
                title: 'Dispensing Booth / Cubical No',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'previousProduct',
                title: 'Previous Product',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'batchNo',
                title: 'Batch No',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'dispensingStartTime',
                title: 'Dispensing started at',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'dispensingEndTime',
                title: 'Dispensing completed at',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'weighingBalanceCalibratedAsPerSop',
                title: 'Weighing balance calibrated as per SOP',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'calibrationDueDate',
                title: 'Calibration due on date',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'weighingBalanceCode',
                title: 'Weighing balance code',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'weighingBalanceCapacity',
                title: 'Weighing balance capacity',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'rmDispensingAsPerSopNo',
                title: 'RM Dispensing as per SOP No',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'operator',
                title: 'Operator',
                type: 'input',
                required: false
            }
        ],
        table: [
            {
                dataIndex: 'parameters',
                title: 'PARAMETERS',
            },
            {
                dataIndex: 'observation',
                title: 'Observation(Yes/No)',
            },
            {
                dataIndex: 'ckdByStoresSupervisor',
                title: 'Ckd. By Stores supervisor',
            },
            {
                dataIndex: 'verifiedByQA',
                title: 'Verified by QA',
            }
        ]
    },
    data: {
        form: [
            {
                dataIndex: 'dispensingBooth',
                value: '',
            },
            {
                dataIndex: 'previousProduct',
                value: '',
            },
            {
                dataIndex: 'batchNo',
                value: '',
            },
            {
                dataIndex: 'dispensingStartTime',
                value: '',
            },
            {
                dataIndex: 'dispensingEndTime',
                value: '',
            },
            {
                dataIndex: 'weighingBalanceCalibratedAsPerSop',
                value: '',
            },
            {
                dataIndex: 'calibrationDueDate',
                value: '',
            },
            {
                dataIndex: 'weighingBalanceCode',
                value: '',
            },
            {
                dataIndex: 'weighingBalanceCapacity',
                value: '',
            },
            {
                dataIndex: 'rmDispensingAsPerSopNo',
                value: '',
            },
            {
                dataIndex: 'operator',
                value: '',
            },
        ],
        table: [
            {
                parameters: 'Cleanliness of the Dispensing area as per SOP',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'Accessories/scoops/spatula cleaned as per SOP',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'Previous batch ACCESSORIES removed from area',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'Containers to be used for the batch dispensing are cleaned as per SOP',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'New Polybags to be used for each batch dispensing',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'Updation of logbook for In-process SS container',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            },
            {
                parameters: 'Updation of Dispensing area / equipment cleaning & usage log book',
                observation: '',
                ckdByStoresSupervisor: '',
                verifiedByQA: '',
            }
        ]
    },
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 1
        },
        table: {
            column: 2
        }
    }
}

// export const MANUFACTURING_FLOW_CHART_PROPS = {
//     title: 'Manufacturing Flow Chart',
//     type: 'flowChart',
//     data: [],
//     style: {
//         heading: {
//             titleAlign: 'center' as TitleAlign
//         }
//     }
// }

export const MANUFACTURING_FLOW_CHART_PROPS = {
    title: 'Manufacturing Flow Chart',
    type: 'flowChart',
    data: [
        {
            title: 'Raw Material Dispensing',
            steps: [
                'Cleanliness of the Dispensing area as per SOP',
                'Accessories/scoops/spatula cleaned as per SOP',
                'Previous batch ACCESSORIES removed from area',
                'Containers to be used for the batch dispensing are cleaned as per SOP',
                'New Polybags to be used for each batch dispensing',
                'Updation of logbook for In-process SS container',
                'Updation of Dispensing area / equipment cleaning & usage log book',
            ]
        }
    ],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        }
    }
}

export const RAW_MATERIAL_DISPENSING_LIST_PROPS = {
    // title: 'General Dos and Donts',
    data: [],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        }
    }
};

export const RAW_MATERIAL_DISPENSING_AREA_TEMP_PROPS = {
    title: 'Raw Material Dispensing Area Temperature & % Relative humidity for monitoring (Frequency at the initial stage & every two hours ± 10 minutes)',
    type: 'table',
    metaData: [
        {
            dataIndex: 'Date',
            title: 'Date',
        },
        {
            dataIndex: 'Time',
            title: 'Time',
        },
        {
            dataIndex: 'Thermo-hygrometer-ID',
            title: 'Thermo-hygrometer ID',
        },
        {
            dataIndex: 'Temperature',
            title: 'Temperature (for monitoring)',
        },
        {
            dataIndex: 'RH_monitoring',
            title: '% RH (for monitoring)',
        },
        {
            dataIndex: 'CheckedBy',
            title: 'Checked by',
        },
        {
            dataIndex: 'VerifiedBy',
            title: 'Verified by',
        },
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
};

export const EQUIPMENT_CALIBRATION_SOP_DETAILS_PROPS = {
    title: 'Equipments Calibration & Operations SOP details:',
    type: 'table',
    metaData: [
        {
            dataIndex: 'Equipment',
            title: 'Equipment',
        },
        {
            dataIndex: 'CalibrationSOPNo',
            title: 'Calibration SOP No. & calibrated on date',
        },
        {
            dataIndex: 'OperationSOPNo',
            title: 'Operation SOP No',
        },
        {
            dataIndex: 'OperatorName.',
            title: 'Operator name',
        },
        {
            dataIndex: 'CheckedBy',
            title: 'Checked by prod',
        },
        {
            dataIndex: 'VerifiedBy',
            title: 'Verified by',
        },
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
};

export const MANUFACTURING_PROPS = {
    title: 'MANUFACTURING',
    type: 'table',
    metaData: [
        { title: 'Date', dataIndex: 'Date', width: '10%' },
        { title: 'Step', dataIndex: 'Step', width: '10%' },
        { title: 'Procedure', dataIndex: 'Procedure', width: '20%' },
        { title: 'Qty', dataIndex: 'Qty', width: '7%' },
        { title: 'From Time', dataIndex: 'From', width: '10%' },
        { title: 'To Time', dataIndex: 'To', width: '10%' },
        { title: 'Observation', dataIndex: 'Observation', width: '19%' },
        { title: 'Done By', dataIndex: 'DoneBy', width: '7%' },
        { title: 'Ckd By', dataIndex: 'CkdBy', width: '7%' }
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        }
    }
};

export const BULK_SAMPLING_PROPS = {
    title: 'BULK SAMPLING: (Production should raise test request form & intimate QA/QC to collect bulk sample)',
    type: 'form',
    metaData: [
        {
            dataIndex: 'checkedByProduction',
            title: 'Checked by Production: Sign:',
        },
        {
            dataIndex: 'checkedByProductionDate',
            title: 'Checked by Production: date:',
        },
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        },
        form: {
            column: 1
        }
    }
}

export const BULK_SAMPLE_PROPS = {
    title: 'Analyse the bulk sample for the following parameters:',
    type: 'table',
    metaData: [
        {
            dataIndex: 'S. No.',
            title: 'S. No.',
        },
        {
            dataIndex: 'Parameter',
            title: 'Parameter',
        },
        {
            dataIndex: 'Specification',
            title: 'Specification',
        },
        {
            dataIndex: 'Observations',
            title: 'Observations',
        }
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        table: {
            column: 2
        }
    }
}

export const BULK_SPECIFICATION_PROPS = {
    title: 'Bulk Specification: Complies /Doesn’t Complies',
    type: 'list',
    metaData: [
        {
            dataIndex: 'checkedByProduction',
            title: 'Checked by Production: Sign:',
        },
        {
            dataIndex: 'checkedByProductionDate',
            title: 'Checked by Production: date:',
        },
        {
            dataIndex: 'verifiedByQaSign',
            title: 'Verified by QA: Sign:',
        },
        {
            dataIndex: 'verifiedByQaDate',
            title: 'Verified by QA: date:',
        },
    ],
    data: [],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        },
        form: {
            column: 2
        }
    }
}

export const BULK_UNLOADING_PROPS = {
    title: 'BULK UNLOADING',
    type: 'tableWithForm',
    metaData: {
        form: [
            {
                dataIndex: 'BeforeUse',
                title: 'Before use',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'CheckedBy',
                title: 'Checked by:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'VerifiedBy',
                title: 'Verified by:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'PreviousProduct',
                title: 'Previous Product:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'BatchNo:',
                title: 'Batch No:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'TotalBulkWt',
                title: 'Total Bulk wt:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'AfterUse',
                title: 'After use:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'CheckedBy',
                title: 'Checked by:',
                type: 'input',
                required: false
            },
            {
                dataIndex: 'VerifiedBy',
                title: 'Verified by:',
                type: 'input',
                required: false
            },
        ],
        table: [
            {
                dataIndex: 'Date',
                title: 'Date',
            },
            {
                dataIndex: 'SSVesselNo',
                title: 'SS Vessel No.',
            },
            {
                dataIndex: 'Gross',
                title: 'Gross wt. (kg)',
            },
            {
                dataIndex: 'Tare',
                title: 'Tare wt. (kg)',
            },
            {
                dataIndex: 'Net',
                title: 'Net. wt. (kg)',
            },
            {
                dataIndex: 'WeightBy',
                title: 'Weighed by',
            },
            {
                dataIndex: 'CheckedBy',
                title: 'Checked by',
            }
        ]
    },
    data: {
        form: [],
        table: []
    },
    style: {
        heading: {
            titleAlign: 'center' as TitleAlign
        },
        form: {
            column: 1
        },
        table: {
            column: 2
        }
    }
}

export const BULK_YEILD_CALCULATION_PROPS = {
    title: 'BULK YIELD CALCULATIONS:',
    type: 'form',
    metaData: [
        {
            dataIndex: 'theoreticalWeight',
            title: 'Theoretical weight of the batch',
        },
        {
            dataIndex: 'totalWeightObtained',
            title: 'Total weight of the batch obtained',
        },
        {
            dataIndex: 'totalWeightObtained',
            title: 'Total weight obtained (Kg.) + Sample Qty. (Kg)',
        },
        {
            dataIndex: 'theoreticalWeight',
            title: 'Theoretical weight (Kg)',
        },
        {
            dataIndex: 'doneBySign',
            title: 'Done by/date (Prod. Supervisor): Sign:',
        },
        {
            dataIndex: 'doneByDate',
            title: 'Done by/date (Prod. Supervisor): date:',
        },
        {
            dataIndex: 'verifiedByQaSign',
            title: 'Verified by QA: Sign:',
        },
        {
            dataIndex: 'verifiedByQaDate',
            title: 'Verified by QA: date:',
        },
    ],
    data: [
    ],
    style: {
        heading: {
            titleAlign: 'left' as TitleAlign
        },
        form: {
            column: 2
        }
    }
}
