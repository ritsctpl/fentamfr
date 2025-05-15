"use client"
import { useEffect, useState } from "react";
import { Button, Card, message } from 'antd';
import api from "@services/api";
import CommonAppBar from "@components/CommonAppBar";
import { Editor } from "@monaco-editor/react";

export default function NqMessage() {
    const [xmlContent, setXmlContent] = useState('');
    const [call, setCall] = useState(0);
    const [loading, setLoading] = useState(false);

    const formatXML = (input: string) => {
        try {
            const regex = /(>)(<)(\/*)/g;
            const formatted = input.replace(regex, '$1\n$2$3');
            let pad = 0;
            const lines = formatted.split('\n');
            const result = lines.map(line => {
                let indent = '';
                if (line.match(/.+<\/\w[^>]*>$/)) {
                    // Line contains closing tag
                    indent = '  '.repeat(pad);
                } else if (line.match(/^<\/\w/)) {
                    // Line starts with closing tag
                    pad--;
                    indent = '  '.repeat(pad);
                } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
                    // Line contains opening tag
                    indent = '  '.repeat(pad);
                    pad++;
                } else {
                    indent = '  '.repeat(pad);
                }
                return indent + line;
            });
            return result.join('\n');
        } catch (e) {
            return input; // Return original if formatting fails
        }
    };

    const handleChange = (e: string) => {
        setXmlContent(e);
    };

    const handleFormat = () => {
        setXmlContent(formatXML(xmlContent));
    };

    const postMessage = async () => {
        try {
            setLoading(true);
            await api.post(
                '/integration-service/enqueue-message',
                xmlContent,
                { headers: { 'Content-Type': 'application/xml' } }
            );
            message.success('Message sent successfully');
            setXmlContent(''); // Clear editor after successful send
        } catch (error) {
            message.error('Failed to send message');
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <CommonAppBar
                onSearchChange={() => { }}
                allActivities={null}
                // color="#006568"
                // logoHeader={'HIMALAYA'}
                username={''}
                site={''}
                appTitle={'Message Enqueuer Application'}
                onSiteChange={() => setCall(call + 1)}
            />
            <div style={{ padding: '0px', flex: 1 }}>
                <Card
                    title="XML Editor"
                    bordered={false}
                    style={{ height: '100%' }}
                    bodyStyle={{ height: '90%' }}
                >
                    <div style={{ height: '95%', width: '100%' ,border: '1px solid #d9d9d9', borderRadius: 4, padding: 12,boxSizing: 'border-box' }}>
                        <Editor
                            language="xml"
                            value={xmlContent}
                            onChange={(e) => handleChange(e)}
                            options={{
                                minimap: { enabled: false },
                                scrollbar: { alwaysConsumeMouseWheel: false },
                                fontSize: 14,
                                fontFamily: 'monospace',
                                lineHeight: 1.5
                            }}
                            height="calc(100vh - 300px)"
                            width="100%"
                            defaultValue={xmlContent}
                        />
                    </div>
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        height: '5%'
                    }}>
                        <Button
                            onClick={handleFormat}
                            size="middle"
                        >
                            Format XML
                        </Button>
                        <Button
                            type="primary"
                            onClick={postMessage}
                            loading={loading}
                            size="middle"
                        >
                            Send Message
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
