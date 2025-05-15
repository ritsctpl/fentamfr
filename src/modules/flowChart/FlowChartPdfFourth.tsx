
import React, { useState } from "react";
import { Button, Modal, Input, Space } from "antd";
import { PlusOutlined, DownloadOutlined, ArrowRightOutlined, ArrowDownOutlined, DeleteOutlined, EllipsisOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface WorkflowStep {
  id: string;
  text: string;
  direction: "right" | "down" | null;
  children: WorkflowStep[];
}

const FlowChartPdfFourth = () => {
  const [inputText, setInputText] = useState("");
  const [rootStep, setRootStep] = useState<WorkflowStep | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddStep = () => {
    if (inputText.trim()) {
      const newStep = { id: generateId(), text: inputText.trim(), direction: null, children: [] };
      if (!rootStep) {
        setRootStep(newStep);
      } else {
        setRootStep(addStepToFlow(rootStep, newStep));
      }
      setInputText("");
    }
  };

  const addStepToFlow = (currentStep: WorkflowStep, newStep: WorkflowStep): WorkflowStep => {
    if (currentStep.children.length === 0) {
      return { ...currentStep, children: [newStep] };
    }
    return {
      ...currentStep,
      children: currentStep.children.map((child, index) =>
        index === currentStep.children.length - 1 ? addStepToFlow(child, newStep) : child
      ),
    };
  };

  const handleDeleteStep = (stepToDelete: WorkflowStep, parentStep?: WorkflowStep) => {
    if (!parentStep) {
      setRootStep(null);
    } else {
      const updatedParent = {
        ...parentStep,
        children: parentStep.children.filter((child) => child.id !== stepToDelete.id),
      };
      setRootStep(updateStepInFlow(rootStep!, updatedParent));
    }
  };

  const updateStepInFlow = (currentStep: WorkflowStep, stepToUpdate: WorkflowStep): WorkflowStep => {
    if (currentStep.id === stepToUpdate.id) {
      return stepToUpdate;
    }
    return {
      ...currentStep,
      children: currentStep.children.map((child) => updateStepInFlow(child, stepToUpdate)),
    };
  };

  const handleChangeDirection = (step: WorkflowStep, direction: "right" | "down") => {
    const updatedStep = { ...step, direction };
    setRootStep(updateStepInFlow(rootStep!, updatedStep));
    setIsModalOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      const element = document.getElementById("workflow-export-container");
      
      if (element) {
        console.log("Exporting element:", element);
        const canvas = await html2canvas(element, { backgroundColor: "white" });

        if (canvas) {
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 190; // Adjust as needed
          const pageHeight = pdf.internal.pageSize.height;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save("workflow.pdf");
        } else {
          console.error("Canvas generation failed.");
        }
      } else {
        console.error("Element for export not found.");
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const openModal = (step: WorkflowStep) => {
    setCurrentStep(step);
    setIsModalOpen(true);
  };

  const StepContent: React.FC<{ step: WorkflowStep; hideActions?: boolean }> = ({ step, hideActions }) => (
    <div className="step-content">
      <p className="step-text">{step.text}</p>
      {!isExporting && !hideActions && (
        <Button
          icon={<EllipsisOutlined />}
          shape="circle"
          onClick={() => openModal(step)}
          className="action-button"
        />
      )}
    </div>
  );

  const renderWorkflow = (step: WorkflowStep | null, hideActions?: boolean): JSX.Element | null => {
    if (!step) return null;
  
    return (
      <div className={`workflow ${step.direction === "right" ? "flex-row" : "flex-col"}`}>
        <StepContent step={step} hideActions={hideActions} />
  
        {step.children.length > 0 && (
          <div className={`workflow ${step.direction === "right" ? "flex-row" : "flex-col"}`}>
            <div className={`arrow-line ${step.direction === "right" ? "horizontal" : "vertical"}`} />
            {step.direction === "right" ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50px', height: '100%', minHeight: '50px' }}>
                <ArrowRightOutlined className="arrow-icon" />
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50px', height: '100%', minHeight: '50px' }}>
                <ArrowDownOutlined className="arrow-icon" />
              </div>
            )}
            <div className={`${step.direction === "right" ? "ml-4" : "mt-4"}`}>
              {step.children.map((childStep, index) => (
                <div key={childStep.id}>
                  {renderWorkflow(childStep, hideActions)}
                  {index < step.children.length - 1 && (
                    <div className="arrow-line vertical" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="workflow-builder">
      <Space>
        <Input.TextArea
          placeholder="Enter workflow step..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={2}
          className="input-textarea"
        />
        <Button onClick={handleAddStep} type="primary" icon={<PlusOutlined />}>
          Add Step
        </Button>
        <Button onClick={handleExport} icon={<DownloadOutlined />} disabled={isExporting}>
          Export
        </Button>
      </Space>

      <div id="workflow-container" className="workflow-container">
        {!rootStep ? (
          <div className="empty-message">
            Start building your workflow by adding steps above!
          </div>
        ) : (
          renderWorkflow(rootStep)
        )}
      </div>

      {/* Separate container for export */}
      <div id="workflow-export-container" className="workflow-export-container">
        {!rootStep ? (
          <div className="empty-message">
            Start building your workflow by adding steps above!
          </div>
        ) : (
          renderWorkflow(rootStep, true) // Hide actions for export
        )}
      </div>

      <Modal
        title="Step Actions"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {currentStep && (
          <Space direction="vertical" size="middle">
            <Button
              onClick={() => handleChangeDirection(currentStep, "right")}
              type={currentStep.direction === "right" ? "primary" : "default"}
              icon={<ArrowRightOutlined />}
            >
              Right
            </Button>
            <Button
              onClick={() => handleChangeDirection(currentStep, "down")}
              type={currentStep.direction === "down" ? "primary" : "default"}
              icon={<ArrowDownOutlined />}
            >
              Down
            </Button>
            <Button
              onClick={() => handleDeleteStep(currentStep!)}
              type="default"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default FlowChartPdfFourth;
