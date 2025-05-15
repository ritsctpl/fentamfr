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
                <h1 style={style.title}>Overall Dashboard User Manual</h1>
                <img src={logo.src} alt="logo" style={style.logo} />
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>1. Introduction</h2>
                <table style={style.table}>
                    <tbody>
                        <tr>
                            <td style={style.td}><strong>Purpose:</strong></td>
                            <td style={style.td}>To provide a comprehensive overview of production metrics, OEE (Overall Equipment Effectiveness), and real-time monitoring capabilities across three main screens.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Target Users:</strong></td>
                            <td style={style.td}>Production managers, supervisors, engineers, and system administrators.</td>
                        </tr>
                        <tr>
                            <td style={style.td}><strong>Module Name:</strong></td>
                            <td style={style.td}>Overall Dashboard</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>2. Dashboard Screens</h2>
                
                <div style={style.section}>
                    <h3 style={style.subTitle}>2.1. Prescriptive Insights Screen</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Component</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Functionality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>OEE Overview</td>
                                <td style={style.td}>Overall Equipment Effectiveness metrics</td>
                                <td style={style.td}>Displays OEE trends by day, month, and year with interactive graphs</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Performance Metrics</td>
                                <td style={style.td}>Performance analysis graphs</td>
                                <td style={style.td}>Shows performance trends with daily, monthly, and yearly comparisons</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Quality Analysis</td>
                                <td style={style.td}>Quality metrics visualization</td>
                                <td style={style.td}>Presents quality trends across different time periods</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Availability Tracking</td>
                                <td style={style.td}>Availability metrics display</td>
                                <td style={style.td}>Shows availability trends with time-based comparisons</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Line Data Overview</td>
                                <td style={style.td}>Production line metrics</td>
                                <td style={style.td}>Displays comprehensive line performance data with drill-down capabilities</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>2.2. Work Center Analysis Screen</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Component</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Functionality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Machine Timeline</td>
                                <td style={style.td}>Real-time machine status tracking</td>
                                <td style={style.td}>Shows current and historical machine states with detailed timeline</td>
                            </tr>
                            <tr>
                                <td style={style.td}>OEE Comparison</td>
                                <td style={style.td}>Current vs Previous OEE</td>
                                <td style={style.td}>Displays comparative OEE metrics between current and previous periods</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Output Data Analysis</td>
                                <td style={style.td}>Production output metrics</td>
                                <td style={style.td}>Shows detailed output statistics and trends</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Resource Lines</td>
                                <td style={style.td}>Resource utilization tracking</td>
                                <td style={style.td}>Displays resource performance and allocation data</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Shift Analysis</td>
                                <td style={style.td}>Shift-wise performance metrics</td>
                                <td style={style.td}>Shows OEE, Performance, Quality, and Availability by shift</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Rejection Analysis</td>
                                <td style={style.td}>Quality rejection tracking</td>
                                <td style={style.td}>Displays rejection rates and reasons with trend analysis</td>
                            </tr>
                            <tr>
                                <td style={style.td}>What-If Scenarios</td>
                                <td style={style.td}>Performance simulation tool</td>
                                <td style={style.td}>Allows simulation of different production scenarios and their impact</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>2.3. Resource Analysis Screen</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Component</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Functionality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Shift Performance Comparison</td>
                                <td style={style.td}>Current vs Previous Shift Analysis</td>
                                <td style={style.td}>Shows detailed comparison between current and previous shift performance</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Machine Timeline</td>
                                <td style={style.td}>Resource activity tracking</td>
                                <td style={style.td}>Displays detailed timeline of resource activities and states</td>
                            </tr>
                            <tr>
                                <td style={style.td}>What-If Scenarios</td>
                                <td style={style.td}>Resource optimization tool</td>
                                <td style={style.td}>Allows simulation of different resource allocation scenarios</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Performance Metrics</td>
                                <td style={style.td}>Detailed performance analysis</td>
                                <td style={style.td}>Shows comprehensive performance data with trend analysis</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>3. Key Features</h2>
                <div style={style.section}>
                    <h3 style={style.subTitle}>3.1. Real-time Monitoring</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Live machine status updates</li>
                        <li style={style.listItem}>Real-time OEE calculations</li>
                        <li style={style.listItem}>Instant performance metrics</li>
                        <li style={style.listItem}>Active production tracking</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.2. Data Visualization</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Interactive charts and graphs</li>
                        <li style={style.listItem}>Trend analysis</li>
                        <li style={style.listItem}>Comparative metrics</li>
                        <li style={style.listItem}>Customizable views</li>
                    </ul>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>3.3. Analysis Tools</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>OEE component breakdown</li>
                        <li style={style.listItem}>Downtime analysis</li>
                        <li style={style.listItem}>Performance tracking</li>
                        <li style={style.listItem}>Quality metrics</li>
                    </ul>
                </div>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>4. Navigation and Controls</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Control</th>
                            <th style={style.th}>Function</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>Date Picker</td>
                            <td style={style.td}>Select date range for data viewing</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Shift Selector</td>
                            <td style={style.td}>Choose specific shift data</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Machine Toggle</td>
                            <td style={style.td}>Switch between machine and manual data sources</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Work Center Filter</td>
                            <td style={style.td}>Filter data by specific work centers</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Search Function</td>
                            <td style={style.td}>Quick search for specific metrics or data</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Drill-Down Button</td>
                            <td style={style.td}>Access detailed analysis view</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>5. Data Management</h2>
                <div style={style.section}>
                    <h3 style={style.subTitle}>5.1. Data Sources</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Machine data (automatic)</li>
                        <li style={style.listItem}>Manual data entry</li>
                        <li style={style.listItem}>Historical records</li>
                        <li style={style.listItem}>Real-time sensors</li>
                    </ul>
                </div>

                {/* <div style={style.section}>
                    <h3 style={style.subTitle}>5.2. Data Export</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Export to Excel</li>
                        <li style={style.listItem}>PDF reports</li>
                        <li style={style.listItem}>Custom data views</li>
                    </ul>
                </div> */}
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>6. Troubleshooting</h2>
                <table style={style.table}>
                    <thead>
                        <tr>
                            <th style={style.th}>Issue</th>
                            <th style={style.th}>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={style.td}>No data displayed</td>
                            <td style={style.td}>Check date range and filters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Real-time updates not working</td>
                            <td style={style.td}>Verify machine connection and toggle status</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Incorrect metrics</td>
                            <td style={style.td}>Validate data source and calculation parameters</td>
                        </tr>
                        <tr>
                            <td style={style.td}>Performance issues</td>
                            <td style={style.td}>Clear browser cache and refresh page</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>7. Best Practices</h2>
                <ul style={style.list}>
                    <li style={style.listItem}>Regularly check and validate data accuracy</li>
                    <li style={style.listItem}>Use appropriate date ranges for analysis</li>
                    <li style={style.listItem}>Monitor real-time alerts and notifications</li>
                    <li style={style.listItem}>Export and backup important data regularly</li>
                    <li style={style.listItem}>Keep track of system updates and new features</li>
                </ul>
            </div>

            <div style={style.section}>
                <h2 style={style.sectionTitle}>8. Detailed Component Contents</h2>
                
                <div style={style.section}>
                    <h3 style={style.subTitle}>8.1. Column Contents and Data Fields</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Column Name</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Data Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>OEE</td>
                                <td style={style.td}>Overall Equipment Effectiveness - Calculated as (Availability × Performance × Quality)</td>
                                <td style={style.td}>Percentage (%)</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Availability</td>
                                <td style={style.td}>Machine running time vs planned production time</td>
                                <td style={style.td}>Percentage (%)</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Performance</td>
                                <td style={style.td}>Actual production rate vs ideal production rate</td>
                                <td style={style.td}>Percentage (%)</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Quality</td>
                                <td style={style.td}>Good parts produced vs total parts produced</td>
                                <td style={style.td}>Percentage (%)</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Planned Quantity</td>
                                <td style={style.td}>Target production quantity for the period</td>
                                <td style={style.td}>Number</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Actual Quantity</td>
                                <td style={style.td}>Total parts produced in the period</td>
                                <td style={style.td}>Number</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Good Quantity</td>
                                <td style={style.td}>Number of parts meeting quality standards</td>
                                <td style={style.td}>Number</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Downtime</td>
                                <td style={style.td}>Total time machine was not running</td>
                                <td style={style.td}>Hours/Minutes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.2. Work Center Details</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Component</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Functionality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Work Center ID</td>
                                <td style={style.td}>Unique identifier for each work center</td>
                                <td style={style.td}>Used for tracking and filtering specific work centers</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Current OEE</td>
                                <td style={style.td}>Real-time OEE value</td>
                                <td style={style.td}>Shows current performance level</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Output Metrics</td>
                                <td style={style.td}>Production output data</td>
                                <td style={style.td}>Displays current and target production values</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Machine Timeline</td>
                                <td style={style.td}>Machine status history</td>
                                <td style={style.td}>Shows machine states and transitions</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Performance Charts</td>
                                <td style={style.td}>Visual performance data</td>
                                <td style={style.td}>Displays trends and comparisons</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.3. Resource Details</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Component</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Functionality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Resource ID</td>
                                <td style={style.td}>Unique identifier for each resource</td>
                                <td style={style.td}>Used for tracking specific resources</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Resource Status</td>
                                <td style={style.td}>Current state of the resource</td>
                                <td style={style.td}>Shows if resource is active, idle, or down</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Resource Metrics</td>
                                <td style={style.td}>Performance data for the resource</td>
                                <td style={style.td}>Displays efficiency and utilization</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Resource Timeline</td>
                                <td style={style.td}>Historical data for the resource</td>
                                <td style={style.td}>Shows past performance and issues</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.4. Routing and Navigation</h3>
                    <table style={style.table}>
                        <thead>
                            <tr>
                                <th style={style.th}>Route</th>
                                <th style={style.th}>Description</th>
                                <th style={style.th}>Access Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={style.td}>Main Dashboard</td>
                                <td style={style.td}>Overview of all metrics</td>
                                <td style={style.td}>Default landing page</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Work Center View</td>
                                <td style={style.td}>Detailed work center data</td>
                                <td style={style.td}>Click on work center card</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Resource View</td>
                                <td style={style.td}>Individual resource details</td>
                                <td style={style.td}>Click on resource in work center</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Analysis Screen</td>
                                <td style={style.td}>Detailed analysis tools</td>
                                <td style={style.td}>Click Analysis button</td>
                            </tr>
                            <tr>
                                <td style={style.td}>Drill-Down View</td>
                                <td style={style.td}>In-depth metrics analysis</td>
                                <td style={style.td}>Click Drill-Down button</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={style.section}>
                    <h3 style={style.subTitle}>8.5. Data Relationships</h3>
                    <ul style={style.list}>
                        <li style={style.listItem}>Work Centers contain multiple Resources</li>
                        <li style={style.listItem}>Resources contribute to Work Center OEE</li>
                        <li style={style.listItem}>Metrics flow from Resources to Work Centers to Overall Dashboard</li>
                        <li style={style.listItem}>Data updates in real-time across all levels</li>
                        <li style={style.listItem}>Changes at Resource level affect Work Center metrics</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserInstructions;
