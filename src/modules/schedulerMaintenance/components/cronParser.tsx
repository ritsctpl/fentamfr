import React, { useState, useEffect, useCallback } from 'react';
import cronParser from 'cron-parser';
import { debounce } from '@mui/material';

const CronExpressionBuilder = ({ setCronExpressions, cronExpressions, visible }) => {
    if (!cronExpressions) {
        setCronExpressions('0 0 * * * ?');
    }
    const [second, setSecond] = useState('0');
    const [minute, setMinute] = useState('0');
    const [minuteInput, setMinuteInput] = useState('0');
    const [hour, setHour] = useState('*');
    const [dayOfMonth, setDayOfMonth] = useState('*');
    const [month, setMonth] = useState('*');
    const [dayOfWeek, setDayOfWeek] = useState('?');  // Default to '?'
    const [year, setYear] = useState('');  // Optional year field
    const [cronExpression, setCronExpression] = useState('0 0 * * * ?');
    const [nextRunTimes, setNextRunTimes] = useState([]);
    const [error, setError] = useState('');

    // Helper function to parse the cron expression into individual components
    const parseCronExpression = useCallback((expression) => {
        if (!expression) return;

        const parts = expression.split(' ');
        if (parts.length >= 6 && parts.length <= 7) {
            const [parsedSecond, parsedMinute, parsedHour, parsedDayOfMonth, parsedMonth, parsedDayOfWeek, parsedYear] = parts;
            setSecond(parsedSecond || '0');
            // Add */ before the minute value if it doesn't already have it
            setMinute(parsedMinute?.startsWith('*/') ? parsedMinute : (parsedMinute === '0' ? '0' : `*/${parsedMinute}`) || '0');
            setMinuteInput(parsedMinute.replace('*/', '') || '0');
            setHour(parsedHour || '*');
            setDayOfMonth(parsedDayOfMonth || '*');
            setMonth(parsedMonth || '*');
            setDayOfWeek(parsedDayOfWeek || '?');
            setYear(parsedYear || ''); // Set year if provided
        }
    }, []);

    // Debounced function to update the cron expression and next run times
    const updateCronExpression = useCallback(debounce(() => {
        // Prepare the cron expression in Quartz format: second minute hour day-of-month month day-of-week year
        const displayExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year}`;

        const parsingExpression = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year}`;

       
            setCronExpression(displayExpression);
            setCronExpressions(displayExpression);  // Update display expression
        

        if (second !== '*' || minute !== '*' || hour !== '*' || dayOfMonth !== '*' || month !== '*' || dayOfWeek !== '?' || year !== '') {
            try {
                const interval = cronParser.parseExpression(parsingExpression);  // Use parsing expression for next run times
                const times = Array.from({ length: 5 }, () => interval.next().toString());
                setNextRunTimes(times);
                setError('');
            } catch (error) {
                setNextRunTimes([]);
                setError('Invalid cron expression.');
            }
        } else {
            setNextRunTimes([]);
            setError('');
        }
    }), [second, minute, hour, dayOfMonth, month, dayOfWeek, year, cronExpression, setCronExpressions]);

    // Parse cron expression when component mounts or cronExpression prop changes
    useEffect(() => {
        if (cronExpressions) {
            parseCronExpression(cronExpressions);
        }
    }, [cronExpressions, visible]);

    // Update cron expression and next run times whenever any input changes
    useEffect(() => {
        updateCronExpression();
    }, [second, minute, hour, dayOfMonth, month, dayOfWeek, year, updateCronExpression]);

    // Handle reset button click
    const resetFields = () => {
        setSecond('0');
        setMinute('0');
        setHour('*');
        setDayOfMonth('*');
        setMonth('*');
        setDayOfWeek('?');
        setYear('');
    };
console.log(minuteInput,'minuteInput');
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Cron Expression Builder (Quartz Format)</h2>

            {/* Display error message if invalid cron expression */}
            {error && <div style={{ color: 'red', marginBottom: '15px' }}><strong>{error}</strong></div>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="0-59">Seconds:</label>
                    <select value={second} onChange={(e) => setSecond(e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="0">0</option>
                        {Array.from(Array(60).keys()).map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="0-59">Minutes:</label>
                    <select value={minuteInput} onChange={(e) => {
                        const value = e.target.value;
                        const formattedValue = value === '1' ? '*/1' : value; // Format to */1 if selected value is 1
                        setMinute(formattedValue);  // Update minute state with formatted value
                        setMinuteInput(formattedValue);  // Optionally keep minuteInput in sync
                    }} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="0">0</option>
                        {Array.from(Array(60).keys()).map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="0-23 (24-hour format)">Hours:</label>
                    <select value={hour} onChange={(e) => setHour(e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="*">Hours</option>
                        {Array.from(Array(24).keys()).map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="1-31 (Days of the month)">Day of Month:</label>
                    <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="*">Every Day</option>
                        {Array.from(Array(31).keys()).map(i => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="1-12 or JAN-DEC">Month:</label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="*">Every Month</option>
                        {Array.from(Array(12).keys()).map(i => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="1-7 or SUN-SAT">Day of Week:</label>
                    <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} style={{ padding: '8px', fontSize: '14px' }}>
                        <option value="?">No specific day</option>
                        <option value="1">Sunday</option>
                        <option value="2">Monday</option>
                        <option value="3">Tuesday</option>
                        <option value="4">Wednesday</option>
                        <option value="5">Thursday</option>
                        <option value="6">Friday</option>
                        <option value="7">Saturday</option>
                    </select>
                </div>
            </div>

            {/* Year Input (Optional) */}
            {/* <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 45%' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }} title="Optional, empty or 1970-2099">Year:</label>
                    <input 
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{ padding: '8px', fontSize: '14px' }}
                        placeholder="Optional (e.g., 2024)"
                    />
                </div>
            </div> */}

            {/* Display Cron Expression */}
            <div style={{ marginTop: '20px' }}>
                <h4>Cron Expression:</h4>
                <pre>{cronExpression}</pre>
            </div>

            {/* Display Next Run Times */}
            {/* {nextRunTimes.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Next Run Times:</h4>
                    <ul>
                        {nextRunTimes.map((time, index) => (
                            <li key={index}>{time}</li>
                        ))}
                    </ul>
                </div>
            )} */}

            {/* Reset Button */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={resetFields}
                    style={{
                        padding: '10px 15px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default CronExpressionBuilder;
