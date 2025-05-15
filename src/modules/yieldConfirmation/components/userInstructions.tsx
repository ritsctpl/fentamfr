import React from 'react';
import logo from '@/images/FENTA-LOGO-F.png';
const UserInstructions: React.FC = () => {
    const style = {
        manual: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '900px',
            // margin: '40px auto',
            padding: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#000',
            backgroundColor: '#fff'
        },
        header: {
            borderBottom: '2px solid #000',
            marginBottom: '30px',
            paddingBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold' as const,
            margin: '0 0 5px 0'
        },
        section: {
            marginBottom: '25px'
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: 'bold' as const,
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
        },
        subTitle: {
            fontSize: '14px',
            fontWeight: 'bold' as const,
            marginBottom: '10px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            marginBottom: '20px',
            border: '1px solid #000'
        },
        th: {
            border: '1px solid #000',
            padding: '8px',
            textAlign: 'left' as const,
            fontWeight: 'bold' as const,
            backgroundColor: '#fff'
        },
        td: {
            border: '1px solid #000',
            padding: '8px',
            verticalAlign: 'top' as const
        },
        list: {
            marginLeft: '20px',
            marginBottom: '15px'
        },
        listItem: {
            marginBottom: '5px'
        },
        required: {
            marginLeft: '5px'
        },
        logo: {
            width: '100px',
            height: '50px'
        }
    };

    return (
        <div style={style.manual} className="manual-content">
            <div style={style.header}>
                <h1 style={style.title}>Yield Confirmation Screen User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To guide users on how to use the Yield Confirmation Screen for recording production yields, scrap quantities, and completing batches.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production operators, supervisors, and quality control personnel.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Yield Confirmation</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Screen Overview</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Section</th>
                            <th style={style.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Batch Information</td>
                            <td style={style.td}>Displays batch number, phase, operation, and quantity details.</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Yield Entry</td>
                            <td style={style.td}>Fields for entering yield quantity, scrap quantity, and reason codes.</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Action Buttons</td>
                            <td style={style.td}>Complete button to submit the yield confirmation.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Field Definitions</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Field Name</th>
                            <th style={style.th}>Description</th>
                            <th style={style.th}>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Batch No</td>
                            <td style={style.td}>Unique identifier for the production batch</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Phase</td>
                            <td style={style.td}>Current production phase</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Operation</td>
                            <td style={style.td}>Production operation being performed</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Qty</td>
                            <td style={style.td}>Total quantity for the batch</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>UOM</td>
                            <td style={style.td}>Unit of measurement (KG, PCS, EA, etc.)</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Yield</td>
                            <td style={style.td}>Actual quantity produced</td>
                            <td style={style.td}>Yes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Rejection Quantity</td>
                            <td style={style.td}>Quantity of rejected/scrap material</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason Code</td>
                            <td style={style.td}>Code explaining the reason for scrap</td>
                            <td style={style.td}>Yes (if scrap exists)</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Final Report</td>
                            <td style={style.td}>Indicates if this is the final yield report</td>
                            <td style={style.td}>No</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason</td>
                            <td style={style.td}>Detailed explanation for scrap</td>
                            <td style={style.td}>Yes (if scrap exists)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Step-by-Step Instructions</h2>

                <div style={style.section}>
                    <h3 style={style.subTitle}>4.1. Complete Yield Confirmation</h3>
                    <ol style={style.list}>
                        <li style={style.listItem}>Verify the batch information is correct (Batch No, Phase, Operation, Qty)</li>
                        <li style={style.listItem}>Select the appropriate UOM from the dropdown</li>
                        <li style={style.listItem}>Enter the actual yield quantity produced</li>
                        <li style={style.listItem}>If there is scrap:
                            <ul style={style.list}>
                                <li>Enter the rejection quantity</li>
                                <li>Select a reason code from the dropdown</li>
                                <li>Provide a detailed reason in the text area</li>
                            </ul>
                        </li>
                        <li style={style.listItem}>Check the "Final Report" box if this is the final yield report</li>
                        <li style={style.listItem}>Click "Complete" to submit the yield confirmation</li>
                    </ol>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. FAQs / Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Cannot submit yield confirmation</td>
                            <td style={style.td}>Check that all required fields are filled and yield quantity is valid</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Reason code not available</td>
                            <td style={style.td}>Contact system administrator to add new reason codes</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Incorrect batch information</td>
                            <td style={style.td}>Verify you have selected the correct batch from the previous screen</td>
                        </tr>
                        <tr>
                            <td style={style.td}>System error on submission</td>
                            <td style={style.td}>Check your network connection and try again. If problem persists, contact support</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserInstructions;
