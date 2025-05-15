export interface ProcessedMessagesType {
  messageId:string;
  topicName:string;
  processedAt:string;
  message:string;
  status:string;
  errorMessage?:string | null;
}