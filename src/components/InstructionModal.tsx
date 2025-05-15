import { Button, Modal, message, Dropdown } from "antd";
import React, { useState, ReactNode, useRef } from "react";
import { InfoCircleOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface InstructionModalProps {
    children?: ReactNode;
    isButton?: boolean;
    title?: string;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ children ,isButton, title }) => {
    const [open, setOpen] = useState(false);
    const targetRef = useRef();
    const handleClose = () => {
        setOpen(false);
    };

    const handleDownloadPDF = async () => {
        const content = document.querySelector('.manual-content');
        if (!content) {
            message.error('Content not found');
            return;
        }
        // Dynamically import html2pdf.js only on client
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 0.5,
            filename: `${title || 'manual'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(content).save()
            .then(() => message.success('PDF downloaded successfully'))
            .catch((error: any) => {
                console.error('Error generating PDF:', error);
                message.error('Failed to generate PDF');
            });
    };

    const convertHtmlToDocxContent = (element: Element): any[] => {
        const children = Array.from(element.children);
        const content: any[] = [];

        children.forEach(child => {
            switch (child.tagName.toLowerCase()) {
                case 'h1':
                    content.push(new Paragraph({
                        text: child.textContent || '',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }));
                    break;
                case 'h2':
                    content.push(new Paragraph({
                        text: child.textContent || '',
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 }
                    }));
                    break;
                case 'p':
                    content.push(new Paragraph({
                        text: child.textContent || '',
                        spacing: { before: 100, after: 100 }
                    }));
                    break;
                case 'table':
                    const rows = Array.from(child.querySelectorAll('tr'));
                    const tableRows = rows.map(row => {
                        const cells = Array.from(row.querySelectorAll('td, th'));
                        return new TableRow({
                            children: cells.map(cell => new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: cell.textContent || '',
                                        bold: cell.tagName.toLowerCase() === 'th'
                                    })]
                                })],
                                borders: {
                                    top: { style: BorderStyle.SINGLE, size: 1 },
                                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                                    left: { style: BorderStyle.SINGLE, size: 1 },
                                    right: { style: BorderStyle.SINGLE, size: 1 }
                                }
                            }))
                        });
                    });
                    content.push(new Table({ rows: tableRows }));
                    break;
                case 'ol':
                case 'ul':
                    const items = Array.from(child.querySelectorAll('li'));
                    items.forEach((item, index) => {
                        content.push(new Paragraph({
                            text: `${child.tagName === 'OL' ? `${index + 1}.` : '•'} ${item.textContent}`,
                            spacing: { before: 100, after: 100 },
                            indent: { left: 720 } // 0.5 inch indent
                        }));
                    });
                    break;
                default:
                    if (child.children.length > 0) {
                        content.push(...convertHtmlToDocxContent(child));
                    } else if (child.textContent?.trim()) {
                        content.push(new Paragraph({ text: child.textContent }));
                    }
            }
        });

        return content;
    };

    const handleDownloadDOCX = async () => {
        try {
            const content = document.querySelector('.manual-content');
            if (!content) {
                message.error('Content not found');
                return;
            }

            // Create document
            const doc = new Document({
                sections: [{
                    properties: {
                        
                    },   
                    children: convertHtmlToDocxContent(content)
                }],
            });

            // Generate and save document
            const buffer = await Packer.toBlob(doc);
            saveAs(buffer, `${title || 'manual'}.docx`);
            message.success('DOCX downloaded successfully');

        } catch (error) {
            console.error('Error generating DOCX:', error);
            message.error('Failed to generate DOCX');
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'pdf',
            label: 'Download as PDF',
            onClick: handleDownloadPDF,
        },
        {
            key: 'docx',
            label: 'Download as DOCX',
            onClick: handleDownloadDOCX,
        },
    ];

    return (
        <div style={{ width: '100%', height: '100%' }}>
             {isButton ? (
                <InfoCircleOutlined onClick={() => setOpen(true)} />
            ) : (
                <Button onClick={() => setOpen(true)}>
                    <InfoCircleOutlined />
                </Button>
            )}
            <Modal
                open={open}
                onCancel={handleClose}
                footer={null}
                title={null}
                width={'60%'}
                centered
                closable={false}
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Dropdown menu={{ items }} placement="bottomRight">
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            aria-label="Download"
                            style={{ fontSize: 18 }}
                        />
                    </Dropdown>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                        aria-label="Close"
                        style={{ fontSize: 18 }}
                    />
                </div>
                <div ref={targetRef} className="manual-content" style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '12px',
                    lineHeight: '1.5'
                }}>
                    {children}
                </div>
            </Modal>
        </div>
    );
};

export default InstructionModal;