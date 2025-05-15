'use client';
import React from 'react';
import logo from '@/images/fenta_logo.png';

// const PodManual = () => {
//   return (
//     <div style={{ 
//         fontFamily: 'Arial, sans-serif', 
//         maxWidth: '900px', 
//         margin: '40px auto', 
//         padding: '20px', 
//         fontSize: '14px', 
//         lineHeight: '1.5', 
//         color: '#000', 
//         backgroundColor: '#fff' 
//     }}>
//         <div style={{ 
//              borderBottom: '2px solid #000',
//              marginBottom: '30px',
//              paddingBottom: '10px',
//              display: 'flex',
//              justifyContent: 'space-between',
//              alignItems: 'center'
//         }}> 
//             <h1 style={{ 
//                 fontSize: '24px', 
//                 fontWeight: 'bold', 
//                 margin: '0 0 5px 0' 
//             }}>POD Instructions</h1> 
//                 <img src={logo.src} alt="logo" style={{
//             width: '100px',
//             height: '50px'
//         }} />
            
//         </div> 

//         <div style={{ marginBottom: '25px' }}>
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Introduction</h2>
//             <p><strong>Purpose:</strong> To guide users on how to use the POD Screen for logging, updating, and tracking maintenance activities.</p>
//             <p><strong>Target Users:</strong> POD technicians, supervisors, and system admins.</p>
//             <p><strong>Module Name:</strong> POD Management</p>
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>System Access</h2>
//             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
//                 <tbody>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>URL/Application Path</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/recipe_app</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Login Requirement</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Username & Password</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Access Roles</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Technician, Supervisor, Admin</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Navigation Path</h2>
//             <p>Main Menu → POD
//             → POD Entry/Tracking</p>
//         </div>

//         <div style={{ marginBottom: '25px' }}>
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Screen Overview</h2>
//             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
//                 <tbody>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Header</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Filters by Recipe</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>POD Table</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Lists past maintenance records (columns like ID, Recipe, etc.)</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>+ Add New, Edit, Close, Delete</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Form Panel</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Form fields to log or update maintenance</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>

//         <div style={{ marginBottom: '25px' }}> 
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Add New POD Record/Save</h2> 
//             <table style={{
//                 width: '100%',
//                 borderCollapse: 'collapse',
//                 marginBottom: '20px',
//                 border: '1px solid #000'
//             }}>
//                 <thead>
//                     <tr>
//                         <th style={{
//                             border: '1px solid #000',
//                             padding: '8px',
//                             backgroundColor: '#f5f5f5',
//                             fontWeight: 'bold'
//                         }} colSpan={6}>Add New POD Record Steps </th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px', width: '150px' }}>Step 1</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>Click "+ Add New" or select an existing row to edit</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 2: Fields</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
                          
//                         </td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 3: Ingredients Tab (For Active and Inactive)</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             • Name <span style={{ color: 'red' }}>*</span><br />
//                             • Version <span style={{ color: 'red' }}>*</span><br />
//                             • Description <br />
//                             • Sequence <span style={{ color: 'red' }}>*</span><br />
//                             • Quantity <span style={{ color: 'red' }}>*</span><br />
//                             • UOM <span style={{ color: 'red' }}>*</span><br />
//                             • Tolerance <br />
//                             • Material Type <span style={{ color: 'red' }}>*</span><br />
//                             • Supplier ID <br />
//                             • Source Location <br />
//                             • Handling Instructions <br />
//                             • Storage Instructions <br />
//                             • Unit Cost <br />
//                             • Currency <br />
//                             • Total Cost <br />
//                             • Waste Quantity <br />
//                             • Waste UOM <br />
//                             • By-Product Description <br />
//                             • Hazardous <span style={{ color: 'red' }}>*</span><br />
//                         </td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             <h4>Alternate Ingredients</h4>
//                             • Name <span style={{ color: 'red' }}>*</span><br />
//                             • Quantity <span style={{ color: 'red' }}>*</span><br />
//                             • UOM <span style={{ color: 'red' }}>*</span><br />
//                             • Unit Cost <br />
//                             • Total Cost <br />
//                         </td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             <h4>QC Parameter</h4>
//                             • Parameter <span style={{ color: 'red' }}>*</span><br />
//                             • Actual Value <span style={{ color: 'red' }}>*</span><br />
//                             • Tolerance <span style={{ color: 'red' }}>*</span><br />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 4: Phases Tab</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             • Phase Name <span style={{ color: 'red' }}>*</span><br />
//                             • Sequence <span style={{ color: 'red' }}>*</span><br />
//                             • Phase Description <br />
//                             • Entry Phase <span style={{ color: 'red' }}>*</span><br />
//                             • Exit Phase <span style={{ color: 'red' }}>*</span><br />
//                             • Next Phase <span style={{ color: 'red' }}>*</span><br />
//                             • Expected Cycle Time <br />
//                             • Conditional <br />
//                             • Parallel <br />
//                             • Any Order <br />
//                         </td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             <h4>Operation</h4>
//                             • Operation <span style={{ color: 'red' }}>*</span><br />
//                             • Version <span style={{ color: 'red' }}>*</span><br />
//                             • Description <br />
//                             • Instruction <br />
//                             • Sequence <span style={{ color: 'red' }}>*</span><br />
//                             • Type <span style={{ color: 'red' }}>*</span><br />
//                             • Sequential <br />
//                             • Expected Cycle Time <br />
//                             • CCP <br />
//                             • Tools <br />
//                             • Entry Operation <span style={{ color: 'red' }}>*</span><br />
//                             • Last Operation At Phase <br />
//                             • Next Operation <span style={{ color: 'red' }}>*</span><br />
//                         </td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>
//                             <h4>Resource</h4>
//                             • Resource <span style={{ color: 'red' }}>*</span><br />
//                             • Description <br />
//                             • Work Center <span style={{ color: 'red' }}>*</span><br />
//                             • RPM <br />
//                             • Duration <span style={{ color: 'red' }}>*</span><br />
//                             • Pressure <span style={{ color: 'red' }}>*</span><br />
//                         </td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 5: Packaging Information</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
//                             • Packaging Type <span style={{ color: 'red' }}>*</span><br />
//                             • Select packaging type<br />
//                             • Primary Packaging Material<br />
//                             • Secondary Packaging Type<br />
//                             • Container Size<br />
//                             • Label Format<br />
//                             • Storage Temperature (°C)<br />
//                             • Humidity Range (%)<br />
//                             • Protection from Light
//                         </td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 6: Work Center</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }} colSpan={6}>
//                             • Work Center <span style={{ color: 'red' }}>*</span><br />
//                             • Resource <span style={{ color: 'red' }}>*</span><br />
//                             • Description<br />
//                             • System Status <span style={{ color: 'red' }}>*</span>
//                         </td>
//                     </tr>

//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Step 7</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Click "Save" or "Add"</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div> 

//         <div style={{ marginBottom: '25px' }}> 
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Edit/Close/Delete Records</h2> 
//             <ul style={{ marginLeft: '20px', marginBottom: '15px' }}> 
//                 <li style={{ marginBottom: '5px' }}>To Edit: Select record → Click On Row → Update fields → Click "Save"</li> 
//                 <li style={{ marginBottom: '5px' }}>To Close: Select in-progress record → Click "Cancel" Or Close Button on Top</li> 
//                 <li style={{ marginBottom: '5px' }}>To Delete: Select draft record → Click "Delete Icon" → Confirm deletion</li> 
//             </ul> 
//         </div> 

//         <div style={{ marginBottom: '25px' }}> 
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Field Definitions</h2> 
//             <table style={{ 
//                 width: '100%', 
//                 borderCollapse: 'collapse', 
//                 marginBottom: '20px', 
//                 border: '1px solid #000' 
//             }}> 
//                 <thead> 
//                     <tr> 
//                         <th style={{ 
//                             border: '1px solid #000', 
//                             padding: '8px', 
//                             textAlign: 'left', 
//                             fontWeight: 'bold', 
//                             backgroundColor: '#f5f5f5' 
//                         }}>Field Name</th> 
//                         <th style={{ 
//                             border: '1px solid #000', 
//                             padding: '8px', 
//                             textAlign: 'left', 
//                             fontWeight: 'bold', 
//                             backgroundColor: '#f5f5f5' 
//                         }}>Description</th> 
//                         <th style={{ 
//                             border: '1px solid #000', 
//                             padding: '8px', 
//                             textAlign: 'left', 
//                             fontWeight: 'bold', 
//                             backgroundColor: '#f5f5f5' 
//                         }}>Required</th> 
//                     </tr> 
//                 </thead> 
//                 <tbody> 
//                     {[
//                         ['Recipe ID', 'Unique identifier for the item', 'Yes'],
                        
//                     ].map((row, index) => (
//                         <tr key={index}> 
//                             <td style={{ border: '1px solid #000', padding: '8px' }}>{row[0]}</td> 
//                             <td style={{ border: '1px solid #000', padding: '8px' }}>{row[1]}</td> 
//                             <td style={{ border: '1px solid #000', padding: '8px' }}>{row[2]}</td> 
//                         </tr> 
//                     ))} 
//                 </tbody> 
//             </table> 
//         </div> 


//         <div style={{ marginBottom: '25px' }}> 
//             <h2 style={{ 
//                 fontSize: '16px', 
//                 fontWeight: 'bold', 
//                 marginBottom: '15px', 
//                 borderBottom: '1px solid #000', 
//                 paddingBottom: '5px' 
//             }}>Troubleshooting</h2> 
//             <table style={{ 
//                 width: '100%', 
//                 borderCollapse: 'collapse', 
//                 marginBottom: '20px', 
//                 border: '1px solid #000' 
//             }}> 
//                 <thead>
//                     <tr>
//                         <th style={{ 
//                             border: '1px solid #000', 
//                             padding: '8px', 
//                             textAlign: 'left',
//                             fontWeight: 'bold',
//                             backgroundColor: '#f5f5f5'
//                         }}>Issue</th>
//                         <th style={{ 
//                             border: '1px solid #000', 
//                             padding: '8px',
//                             textAlign: 'left',
//                             fontWeight: 'bold',
//                             backgroundColor: '#f5f5f5'
//                         }}>Solution</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Cannot save</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Check all mandatory fields (*) are filled</td>
//                     </tr>
//                     <tr>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Form validation error</td>
//                         <td style={{ border: '1px solid #000', padding: '8px' }}>Check all tabs to ensure required fields are filled in</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     </div>
//   );
// };

// export default PodManual;
const PodManual = () => {
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
            }}>POD Instructions</h1> 
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
            <p><strong>Purpose:</strong> To guide users on how to use the POD Screen for logging, updating, and tracking maintenance activities.</p>
            <p><strong>Target Users:</strong> POD technicians, supervisors, and system admins.</p>
            <p><strong>Module Name:</strong> POD Management</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>/rits/rits/pod_app?WorkStation=POD_NAME</td>
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
            <p>Main Menu → POD Name
            → POD Entry/Tracking</p>
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
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Select the Batch No and Resource for Work List</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>POD Table</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Lists Batch records (columns like ID, Batch No, Recipe, etc.)</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Action Buttons</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Start, Complete, SignOff</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form Panel</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>Form fields to log or update Batch Complete</td>
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
            }}>Header Information</h2>
            <p>The header section contains key information about the current batch:</p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '10px'
            }}>
                <div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>Batch Number</h3>
                    <p>Unique identifier for tracking the production batch through the manufacturing process</p>
                </div>
                <div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>Resource</h3>
                    <p>Equipment and machinery allocated for the current batch production</p>
                </div>
                <div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>Operation</h3>
                    <p>Current manufacturing step or process being performed</p>
                </div>
                
            </div>
            <p>The screen contains two main action buttons:</p>
    <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
        <li style={{ marginBottom: '8px' }}>
            <strong>Go:</strong> Executes the current operation or moves to the next step in the process
        </li>
        <li style={{ marginBottom: '8px' }}>
            <strong>Clear:</strong> Resets all input fields and selections to their default state
        </li>
    </ul>
<div style={{ marginBottom: '25px' }}>
    <h2 style={{ 
        fontSize: '16px', 
        fontWeight: 'bold', 
        marginBottom: '15px', 
        borderBottom: '1px solid #000', 
        paddingBottom: '5px' 
    }}>Machine Status & Break Management</h2>
    
    <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Machine Status</h3>
        <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '15px'
        }}>
            <div style={{
                padding: '10px',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#e6ffe6'
            }}>
                <strong>Machine Up</strong>
                <p>Equipment is operational and running</p>
            </div>
            <div style={{
                padding: '10px',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#ffe6e6'
            }}>
                <strong>Machine Down</strong>
                <p>Equipment requires maintenance or repair</p>
            </div>
        </div>
        
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
                        backgroundColor: '#f5f5f5'
                    }}>Status Type</th>
                    <th style={{ 
                        border: '1px solid #000',
                        padding: '8px',
                        backgroundColor: '#f5f5f5'
                    }}>Description</th>
                    <th style={{ 
                        border: '1px solid #000',
                        padding: '8px',
                        backgroundColor: '#f5f5f5'
                    }}>Required Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Planned Downtime</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Scheduled maintenance or setup</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Log maintenance details</td>
                </tr>
                <tr>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Unplanned Downtime</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Unexpected breakdowns</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>Report issue and maintenance required</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Break Management</h3>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '15px'
        }}>
            <button style={{
                padding: '10px',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer'
            }}>Start Break/End Break</button>
            
        </div>
      
    </div>
</div>
        </div>
        {/* Action Buttons Section */}
        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Action Buttons</h2>
            <p>The action buttons are arranged vertically on the left side of the screen for easy access:</p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Start:</strong> Initiates a new batch process or operation</li>
                <li style={{ marginBottom: '8px' }}><strong>Sign Off:</strong> Allows users to digitally sign and verify completed steps</li>
                <li style={{ marginBottom: '8px' }}><strong>Complete:</strong> Marks the current process or batch as finished</li>
                <li style={{ marginBottom: '8px' }}><strong>Scrap:</strong> Records rejected or waste materials from the process</li>
                <li style={{ marginBottom: '8px' }}><strong>Line Clearance:</strong> Confirms production line is clean and ready for next batch</li>
                <li style={{ marginBottom: '8px' }}><strong>Approval:</strong> Provides final verification and approval of completed processes</li>
            </ul>
            <p>Click the expand icon (➜) next to each button to view additional options and details.</p>
            <div style={{ 
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Start</button>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Sign Off</button>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Complete</button>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Scrap</button>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Line Clearance</button>
                <button style={{
                    padding: '8px 12px',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}>Approval</button>
            </div>
        </div>

        {/* Batch List Section */}
        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Batch List</h2>
<p>The table supports both single and multi-select row functionality:</p>
<ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
    <li style={{ marginBottom: '5px' }}>
        <strong>Single Select:</strong> Click on any row to select it. The selected row will be highlighted. Only one row can be selected at a time.
    </li>
    <li style={{ marginBottom: '5px' }}>
        <strong>Multi Select:</strong> Hold Ctrl (Windows) or Command (Mac) while clicking rows to select multiple. Use Shift + Click to select a range of rows.
    </li>
    <li style={{ marginBottom: '5px' }}>
        <strong>Button Actions:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
            <li>Start Batch: Initiates a new production batch</li>
            <li>Complete Batch: Finalizes and closes a running batch</li>
            <li>Machine Down: Records equipment downtime or maintenance</li>
            <li>Quality Check: Logs quality control parameters</li>
            <li>Material Request: Creates request for raw materials</li>
            <li>Pause Batch: Temporarily halts production process</li>
        </ul>
    </li>
</ul>
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
                        }}>Batch No</th>
                        <th style={{ 
                            border: '1px solid #000',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        }}>Start Time</th>
                        <th style={{ 
                            border: '1px solid #000',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        }}>Status</th>
                        <th style={{ 
                            border: '1px solid #000',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        }}>Item Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>BATCH001</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>2023-10-01 09:00</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>In Queue</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>7000470</td>
                    </tr>
                    {/* Additional batch rows would be dynamically generated here */}
                </tbody>
            </table>
        </div>

        {/* Plugin Section */}
        <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                borderBottom: '1px solid #000', 
                paddingBottom: '5px' 
            }}>Plugins</h2>
            <p>Plugins can be added dynamically with a maximum of 6 plugins total, displayed in rows of 3. Each plugin has its own close button and clicking a plugin will display its content in the designated plugin section.</p>
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '15px'
            }}>
                <button style={{
                    padding: '8px 15px',
                    // backgroundColor: '#007bff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Line Clearance
                </button>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                marginBottom: '20px'
            }}>
                {/* Example Plugin Cards */}
                <div style={{
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <button style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}>×</button>
                    <h4 style={{marginTop: '10px', marginBottom: '8px'}}>Line Clearance</h4>
                    <p style={{fontSize: '12px', color: '#666'}}>Click to view plugin details</p>
                </div>
                {/* Additional plugin cards would be dynamically added here */}
            </div>
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px'
            }}>
                <div style={{
                    border: '1px solid #000',
                    padding: '15px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <h3 style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        marginBottom: '10px'
                    }}>Plugin 1</h3>
                    <p>Plugin description and functionality</p>
                </div>
                <div style={{
                    border: '1px solid #000',
                    padding: '15px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <h3 style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        marginBottom: '10px'
                    }}>Plugin 2</h3>
                    <p>Plugin description and functionality</p>
                </div>
                <div style={{
                    border: '1px solid #000',
                    padding: '15px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <h3 style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        marginBottom: '10px'
                    }}>Plugin 3</h3>
                    <p>Plugin description and functionality</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PodManual;

