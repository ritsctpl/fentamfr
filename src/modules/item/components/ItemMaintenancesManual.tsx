'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';

const ItemManual = () => {
  return (
    <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '900px', 
        // margin: '40px auto', 
        padding: '20px', 
        fontSize: '14px', 
        lineHeight: '1.5', 
        color: '#000', 
        backgroundColor: '#fff' 
    }}> 
        <div style={{ 
             borderBottom: '2px solid #000',
             marginBottom: '30px',
             paddingBottom: '10px',
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center'
        }}> 
            <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                margin: '0 0 5px 0' 
            }}>Item Maintenance Instructions</h1> 
                <img src={logo.src} alt="logo" style={{
            width: '100px',
            height: '50px'
        }} />
            
        </div> 

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Introduction</h2>
            <p><strong>Purpose:</strong> To guide users on how to use the Item Maintenance Screen for logging, updating, and tracking maintenance activities.</p>
            <p><strong>Target Users:</strong> Maintenance technicians, supervisors, and system admins.</p>
            <p><strong>Module Name:</strong> Maintenance Management</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>System Access</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>URL/Application Path</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/item_app</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Login Requirement</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Username & Password</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Access Roles</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Technician, Supervisor, Admin</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Navigation Path</h2>
            <p>Main Menu &gt; Item Maintenance
            &gt; Maintenance Entry/Tracking</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Screen Overview</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Header</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Filters by Item</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Maintenance Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records (columns like ID, Item, etc.)</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>+ Add New, Edit, Close, Delete</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form Panel</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form fields to log or update maintenance</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Add New Maintenance Record/Save</h2> 
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                border: '1px solid #000'
            }}>
                <thead>
                    <tr>
                        <th style={{
                            border: '1px solid #000',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        }} colSpan={2}>Add New Maintenance Record Steps / Save</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Step 1</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "+ Add New" or select an existing row to edit</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Required Fields</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Item <span style={{ color: 'red' }}>*</span><br />
                            • Revision <span style={{ color: 'red' }}>*</span><br />
                            • Description<br />
                            • Item Group<br />
                            • Status <span style={{ color: 'red' }}>*</span><br />
                            • Procurement Type <span style={{ color: 'red' }}>*</span><br />
                            • Current Version<br />
                            • Item Type <span style={{ color: 'red' }}>*</span><br />
                            • Qty Restriction<br />
                            • Lot Size <span style={{ color: 'red' }}>*</span><br />
                            • Routing<br />
                            • Router Version<br />
                            • BOM<br />
                            • BOM Version<br />
                            • Assembly Datatype<br />
                            • Removal Datatype<br />
                            • Receipt Datatype
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3: Alternate Component Tab</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>
                            • Sequence <span style={{ color: 'red' }}>*</span><br />
                            • Alternate Component <span style={{ color: 'red' }}>*</span><br />
                            • Version <span style={{ color: 'red' }}>*</span><br />
                            • Parent Material <span style={{ color: 'red' }}>*</span><br />
                            • Version <span style={{ color: 'red' }}>*</span><br />
                            • Valid From <br />
                            • Valid To <br />
                        </td>
                    </tr>
                  
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Step 4</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Click "Save" or "Add"</td>
                    </tr>
                </tbody>
            </table>
        </div> 

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Edit/Close/Delete Records</h2> 
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}> 
                <li style={{ marginBottom: '5px' }}>To Edit: Select record &gt; Click On Row &gt; Update fields &gt; Click "Save"</li> 
                <li style={{ marginBottom: '5px' }}>To Close: Select in-progress record &gt; Click "Cancel" Or Close Button on Top</li> 
                <li style={{ marginBottom: '5px' }}>To Delete: Select draft record &gt; Click "Delete Icon" &gt; Confirm deletion</li> 
            </ul> 
        </div> 

        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Field Definitions</h2> 
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginBottom: '20px', 
                border: '1px solid #000' 
            }}> 
                <thead> 
                    <tr> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Field Name</th> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Description</th> 
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left', 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5' 
                        }}>Required</th> 
                    </tr> 
                </thead> 
                <tbody> 
                    {[ 
                        ['Item', 'Unique identifier for the item', 'Yes'],
                        ['Revision', 'Revision number of the item', 'Yes'],
                        ['Description', 'Detailed description of the item', 'No'],
                        ['Item Group', 'Group classification of the item', 'No'],
                        ['Status', 'Current status of the item', 'Yes'],
                        ['Procurement Type', 'How the item is procured', 'Yes'],
                        ['Current Version', 'Current version of the item', 'No'],
                        ['Item Type', 'Type classification of the item', 'Yes'],
                        ['Qty Restriction', 'Quantity restriction for the item', 'No'],
                        ['Lot Size', 'Standard lot size for the item', 'Yes'],
                        ['Routing', 'Routing information for manufacturing', 'No'],
                        ['Router Version', 'Version of the routing', 'No'],
                        ['BOM', 'Bill of Materials reference', 'No'],
                        ['BOM Version', 'Version of the BOM', 'No'],
                        ['Assembly Datatype', 'Data type for assembly', 'No'],
                        ['Removal Datatype', 'Data type for removal', 'No'],
                        ['Receipt Datatype', 'Data type for receipt', 'No']
                    ].map((row, index) => ( 
                        <tr key={index}> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[0]}</td> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[1]}</td> 
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{row[2]}</td> 
                        </tr> 
                    ))} 
                </tbody> 
            </table> 
        </div> 


        <div style={{ marginBottom: '25px' }}> 
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Troubleshooting</h2> 
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginBottom: '20px', 
                border: '1px solid #000' 
            }}> 
                <thead>
                    <tr>
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                        }}>Issue</th>
                        <th style={{ 
                            border: '1px solid #000', 
                            padding: '8px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                        }}>Solution</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Cannot save</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Check all mandatory fields (*) are filled</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form validation error</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Check all tabs to ensure required fields are filled in</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ItemManual;