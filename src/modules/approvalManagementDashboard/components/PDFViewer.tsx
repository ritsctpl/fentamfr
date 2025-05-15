// // components/PDFViewer.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
// import { zoomPlugin } from "@react-pdf-viewer/zoom";
// import { searchPlugin } from "@react-pdf-viewer/search";
// import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
// import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
// import "@react-pdf-viewer/core/lib/styles/index.css";
// import "@react-pdf-viewer/default-layout/lib/styles/index.css";
// import "@react-pdf-viewer/zoom/lib/styles/index.css";
// import "@react-pdf-viewer/search/lib/styles/index.css";
// import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
// import {
//   Modal,
//   Button,
//   Spin,
//   Tooltip,
//   Input,
//   Space,
//   Typography,
//   message,
//   Divider,
// } from "antd";
// import {
//   DownloadOutlined,
//   CloseOutlined,
//   FullscreenOutlined,
//   FullscreenExitOutlined,
//   ZoomInOutlined,
//   ZoomOutOutlined,
//   SearchOutlined,
//   LeftOutlined,
//   RightOutlined,
//   MenuOutlined,
//   FileTextOutlined,
//   PrinterOutlined,
//   CommentOutlined,
//   DeleteOutlined,
//   MessageOutlined,
//   PushpinOutlined,
// } from "@ant-design/icons";

// const { Text } = Typography;
// const { TextArea } = Input;

// // New type for comments
// type Comment = {
//   id: string;
//   page: number;
//   x: number;
//   y: number;
//   text: string;
//   timestamp: number;
// };

// type Props = {
//   fileUrl: string;
//   documentName: string;
//   onClose: () => void;
// };

// const COMMENTS_STORAGE_KEY = "pdf-comments";

// const saveCommentsToLocalStorage = (
//   documentName: string,
//   comments: Comment[]
// ) => {
//   try {
//     const allDocumentComments = JSON.parse(
//       localStorage.getItem(COMMENTS_STORAGE_KEY) || "{}"
//     );
//     allDocumentComments[documentName] = comments;
//     localStorage.setItem(
//       COMMENTS_STORAGE_KEY,
//       JSON.stringify(allDocumentComments)
//     );
//   } catch (error) {
//     console.error("Error saving comments to localStorage:", error);
//     message.error("Failed to save comments");
//   }
// };

// const loadCommentsFromLocalStorage = (documentName: string): Comment[] => {
//   try {
//     const allDocumentComments = JSON.parse(
//       localStorage.getItem(COMMENTS_STORAGE_KEY) || "{}"
//     );
//     return allDocumentComments[documentName] || [];
//   } catch (error) {
//     console.error("Error loading comments from localStorage:", error);
//     return [];
//   }
// };

// const PDFViewer = ({ fileUrl, documentName, onClose }: Props) => {
//   const [loading, setLoading] = useState(true);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageInputValue, setPageInputValue] = useState("1");
//   const [totalPages, setTotalPages] = useState(0);
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSearchActive, setIsSearchActive] = useState(false);

//   // Updated state initialization to load comments from localStorage
//   const [comments, setComments] = useState<Comment[]>(() =>
//     loadCommentsFromLocalStorage(documentName)
//   );

//   // Modify setComments to save to localStorage whenever comments change
//   const updateComments = useCallback(
//     (newComments: Comment[]) => {
//       setComments(newComments);
//       saveCommentsToLocalStorage(documentName, newComments);
//     },
//     [documentName]
//   );

//   const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
//   const [newCommentText, setNewCommentText] = useState("");
//   const [commentPosition, setCommentPosition] = useState<{
//     x: number;
//     y: number;
//     page: number;
//   } | null>(null);

//   // Add a new state to track comment modal visibility
//   const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
//   const [currentModalComment, setCurrentModalComment] =
//     useState<Comment | null>(null);

//   const viewerRef = useRef(null);
//   const pdfContainerRef = useRef<HTMLDivElement>(null);
//   const commentInputRef = useRef<HTMLDivElement>(null);
//   const commentTooltipRef = useRef<HTMLDivElement>(null);

//   // Initialize plugins
//   const pageNavigationPluginInstance = pageNavigationPlugin();
//   const { jumpToPage } = pageNavigationPluginInstance;

//   const zoomPluginInstance = zoomPlugin();
//   const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

//   const searchPluginInstance = searchPlugin({
//     keyword: searchQuery,
//     onHighlightKeyword: (props) => {
//       console.log("Search highlights:", props);
//     },
//   });
//   const { Search } = searchPluginInstance;

//   const thumbnailPluginInstance = thumbnailPlugin();
//   const { Thumbnails } = thumbnailPluginInstance;

//   const handleDocumentLoad = (e) => {
//     setLoading(false);
//     setTotalPages(e.doc.numPages);
//   };

//   const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
//   const toggleSidebar = () => setShowSidebar(!showSidebar);
//   const toggleSearch = () => setIsSearchActive(!isSearchActive);

//   const handlePageChange = useCallback((e: { currentPage: number }) => {
//     const newPage = e.currentPage + 1;
//     setCurrentPage(newPage);
//     setPageInputValue(newPage.toString());
//   }, []);

//   const goToPage = useCallback(
//     (pageNumber: number) => {
//       if (pageNumber >= 1 && pageNumber <= totalPages) {
//         jumpToPage(pageNumber - 1);
//         setCurrentPage(pageNumber);
//         setPageInputValue(pageNumber.toString());
//       }
//     },
//     [totalPages, jumpToPage]
//   );

//   const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Only allow numbers and update both states
//     if (/^\d*$/.test(value)) {
//       setPageInputValue(value);
//       const pageNum = parseInt(value, 10);
//       if (pageNum >= 1 && pageNum <= totalPages) {
//         setCurrentPage(pageNum);
//       }
//     }
//   };

//   const handlePageInputBlur = () => {
//     const pageNum = parseInt(pageInputValue, 10);
//     if (pageNum >= 1 && pageNum <= totalPages) {
//       goToPage(pageNum);
//     } else {
//       // Reset to current page if invalid
//       setPageInputValue(currentPage.toString());
//     }
//   };

//   const handlePageInputKeyPress = (
//     e: React.KeyboardEvent<HTMLInputElement>
//   ) => {
//     if (e.key === "Enter") {
//       handlePageInputBlur();
//     }
//   };

//   const handleDownload = () => {
//     const link = document.createElement("a");
//     link.href = fileUrl;
//     link.download = documentName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleSearchChange = useCallback(
//     (renderSearchProps) => (e) => {
//       const value = e.target.value;
//       setSearchQuery(value);

//       // Ensure search is called with a non-empty string
//       if (value.trim()) {
//         console.log("Performing search for:", value);
//         renderSearchProps.search(value);
//       } else {
//         // Clear highlights if search query is empty
//         renderSearchProps.search("");
//       }
//     },
//     []
//   );

//   // Update methods to use updateComments
//   const handleAddComment = () => {
//     if (!commentPosition || !newCommentText.trim()) {
//       message.warning("Please enter a comment");
//       return;
//     }

//     const newComment: Comment = {
//       id: `comment-${Date.now()}`,
//       page: commentPosition.page,
//       x: commentPosition.x,
//       y: commentPosition.y,
//       text: newCommentText.trim(),
//       timestamp: Date.now(),
//     };

//     updateComments([...comments, newComment]);
//     setNewCommentText("");
//     setCommentPosition(null);
//     message.success("Comment added successfully");
//   };

//   const handlePDFClick = (event: React.MouseEvent<HTMLDivElement>) => {
//     if (!pdfContainerRef.current) return;

//     const containerRect = pdfContainerRef.current.getBoundingClientRect();
//     const x = event.clientX - containerRect.left;
//     const y = event.clientY - containerRect.top;

//     // Set comment position for the current page on double-click
//     if (event.detail === 2) {
//       setCommentPosition({
//         x,
//         y,
//         page: currentPage,
//       });
//       setNewCommentText(""); // Reset comment text when opening new comment box
//     }
//   };

//   const deleteComment = (commentId: string) => {
//     const updatedComments = comments.filter(
//       (comment) => comment.id !== commentId
//     );
//     updateComments(updatedComments);

//     if (selectedComment?.id === commentId) {
//       setSelectedComment(null);
//     }
//   };

//   // Outside click handler for comments
//   useEffect(() => {
//     const handleOutsideClick = (event: MouseEvent) => {
//       // Check if comment input or tooltip is open
//       if (commentPosition || selectedComment) {
//         // Check if the click is outside the comment input and tooltip
//         const isClickInsideInput = commentInputRef.current?.contains(
//           event.target as Node
//         );
//         const isClickInsideTooltip = commentTooltipRef.current?.contains(
//           event.target as Node
//         );

//         if (!isClickInsideInput && !isClickInsideTooltip) {
//           // Close comment input or tooltip
//           setCommentPosition(null);
//           setSelectedComment(null);
//         }
//       }
//     };

//     // Add event listener
//     document.addEventListener("mousedown", handleOutsideClick);

//     // Cleanup
//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, [commentPosition, selectedComment]);

//   // Method to open comment modal
//   const openCommentModal = (comment: Comment) => {
//     setCurrentModalComment(comment);
//     setIsCommentModalVisible(true);
//   };

//   // Method to close comment modal
//   const closeCommentModal = () => {
//     setIsCommentModalVisible(false);
//     setCurrentModalComment(null);
//   };

//   const [showThumbnailSidebar, setShowThumbnailSidebar] = useState(false);
//   const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);

//   const toggleThumbnailSidebar = () =>
//     setShowThumbnailSidebar(!showThumbnailSidebar);
//   const toggleCommentsSidebar = () =>
//     setShowCommentsSidebar(!showCommentsSidebar);

//   return (
//     <Modal
//       open={true}
//       onCancel={onClose}
//       width={isFullscreen ? "100vw" : "85vw"}
//       style={{
//         top: 0,
//         padding: 0,
//         maxWidth: "none",
//         margin: isFullscreen ? 0 : "2.5vh auto",
//       }}
//       bodyStyle={{
//         height: isFullscreen ? "100vh" : "90vh",
//         padding: 0,
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//         borderRadius: "8px",
//       }}
//       footer={null}
//       closable={false}
//       maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
//       className="pdf-viewer-modal"
//     >
//       {/* Header */}
//       <div className="pdf-viewer-header">
//         <div className="header-section">
//           <Button
//             type="text"
//             icon={<MenuOutlined />}
//             onClick={toggleThumbnailSidebar}
//             className="header-btn"
//           />
//           <Text strong ellipsis className="document-title">
//             <FileTextOutlined /> {documentName}
//           </Text>
//         </div>

//         <div className="header-section">
//           <Space>
//             <Button
//               type="text"
//               icon={<LeftOutlined />}
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage === 1}
//             />
//             <Input
//               value={pageInputValue}
//               onChange={handlePageInputChange}
//               onBlur={handlePageInputBlur}
//               onKeyPress={handlePageInputKeyPress}
//               style={{ width: 60, textAlign: "center" }}
//               suffix={<Text type="secondary">/ {totalPages}</Text>}
//             />
//             <Button
//               type="text"
//               icon={<RightOutlined />}
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             />
//           </Space>
//         </div>

//         <div className="header-section">
//           <Space>
//             <Tooltip title="Search">
//               <Button
//                 type="text"
//                 icon={<SearchOutlined />}
//                 onClick={toggleSearch}
//                 className="header-btn"
//               />
//             </Tooltip>

//             <Tooltip title="Comments">
//               <Button
//                 type="text"
//                 icon={<CommentOutlined />}
//                 onClick={toggleCommentsSidebar}
//                 className="header-btn"
//               />
//             </Tooltip>

//             <ZoomOut>
//               {({ onClick }) => (
//                 <Button
//                   type="text"
//                   icon={<ZoomOutOutlined />}
//                   className="header-btn"
//                   onClick={onClick}
//                 />
//               )}
//             </ZoomOut>

//             <CurrentScale>
//               {({ scale }) => (
//                 <Text
//                   type="secondary"
//                   style={{ width: 50, textAlign: "center" }}
//                 >
//                   {Math.round(scale * 100)}%
//                 </Text>
//               )}
//             </CurrentScale>

//             <ZoomIn>
//               {({ onClick }) => (
//                 <Button
//                   type="text"
//                   icon={<ZoomInOutlined />}
//                   className="header-btn"
//                   onClick={onClick}
//                 />
//               )}
//             </ZoomIn>

//             <Button
//               type="text"
//               icon={<PrinterOutlined />}
//               onClick={() => window.open(fileUrl, "_blank")?.print()}
//               className="header-btn"
//             />
//             <Button
//               type="text"
//               icon={<DownloadOutlined />}
//               onClick={handleDownload}
//               className="header-btn"
//             />
//             <Button
//               type="text"
//               icon={
//                 isFullscreen ? (
//                   <FullscreenExitOutlined />
//                 ) : (
//                   <FullscreenOutlined />
//                 )
//               }
//               onClick={toggleFullscreen}
//               className="header-btn"
//             />
//             <Button
//               type="text"
//               icon={<CloseOutlined />}
//               onClick={onClose}
//               className="header-btn"
//             />
//           </Space>
//         </div>
//       </div>

//       {/* Search Bar */}
//       {isSearchActive && (
//         <div className="search-bar">
//           <Search>
//             {(renderSearchProps) => {
//               console.log("Render search props:", renderSearchProps);
//               return (
//                 <Input
//                   prefix={<SearchOutlined />}
//                   placeholder="Search in document"
//                   value={searchQuery}
//                   onChange={handleSearchChange(renderSearchProps)}
//                   style={{ width: "100%" }}
//                 />
//               );
//             }}
//           </Search>
//         </div>
//       )}

//       {/* Main Content */}
//       <div
//         className="pdf-content-container"
//         ref={pdfContainerRef}
//         onClick={handlePDFClick}
//         style={{
//           display: "flex",
//           position: "relative",
//           flex: 1,
//           overflow: "hidden",
//         }}
//       >
//         {/* Thumbnails Sidebar */}
//         {showThumbnailSidebar && (
//           <div
//             className="thumbnail-sidebar"
//             style={{ width: "200px", flexShrink: 0 }}
//           >
//             {loading ? (
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: "100%",
//                   backgroundColor: "#f0f0f0",
//                   padding: "20px",
//                 }}
//               >
//                 <Spin size="large" tip="Loading thumbnails..." />
//               </div>
//             ) : (
//               <Thumbnails />
//             )}
//           </div>
//         )}

//         {/* Comments Sidebar */}
//         {showCommentsSidebar && (
//           <div
//             className="comments-sidebar"
//             style={{
//               width: "300px",
//               flexShrink: 0,
//               position: "absolute",
//               right: 0,
//               top: 0,
//               bottom: 0,
//               zIndex: 10,
//               backgroundColor: "white",
//               borderLeft: "1px solid #e8e8e8",
//               padding: "20px",
//               overflowY: "auto",
//             }}
//           >
//             <div className="comments-header">
//               <Text strong>Comments for {documentName}</Text>
//               <Button
//                 type="text"
//                 icon={<CloseOutlined />}
//                 onClick={toggleCommentsSidebar}
//               />
//             </div>
//             {comments.length === 0 ? (
//               <div className="no-comments">
//                 <Text type="secondary">No comments yet</Text>
//                 <Text
//                   type="secondary"
//                   style={{
//                     fontSize: "0.8em",
//                     display: "block",
//                     marginTop: "8px",
//                   }}
//                 >
//                   Double-click anywhere on the PDF to add a comment
//                 </Text>
//               </div>
//             ) : (
//               <div className="comments-list">
//                 {comments.map((comment) => (
//                   <div key={comment.id} className="comment-item">
//                     <div className="comment-header">
//                       <Text type="secondary">Page {comment.page}</Text>
//                       <Tooltip title="Delete Comment">
//                         <Button
//                           type="text"
//                           icon={<DeleteOutlined />}
//                           size="small"
//                           onClick={() => deleteComment(comment.id)}
//                         />
//                       </Tooltip>
//                     </div>
//                     <Text>{comment.text}</Text>
//                     <Text
//                       type="secondary"
//                       style={{
//                         fontSize: "0.8em",
//                         display: "block",
//                         marginTop: "8px",
//                       }}
//                     >
//                       {new Date(comment.timestamp).toLocaleString()}
//                     </Text>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* PDF Viewer */}
//         <div
//           className="pdf-viewer"
//           style={{
//             flex: 1,
//             overflow: "hidden",
//             position: "relative",
//             width:
//               showThumbnailSidebar || showCommentsSidebar
//                 ? "calc(100% - 500px)"
//                 : "100%",
//           }}
//         >
//           {/* Comment Position Input */}
//           {commentPosition && (
//             <div
//               ref={commentInputRef}
//               className="comment-input-container"
//               style={{
//                 left: `${commentPosition.x}px`,
//                 top: `${commentPosition.y}px`,
//               }}
//               onDoubleClick={(e) => e.stopPropagation()}
//             >
//               <div className="comment-input-header">
//                 <Text strong>Add Comment</Text>
//                 <Button
//                   type="text"
//                   icon={<CloseOutlined />}
//                   size="small"
//                   onClick={() => setCommentPosition(null)}
//                 />
//               </div>
//               <TextArea
//                 rows={4}
//                 placeholder="Write your comment here..."
//                 value={newCommentText}
//                 onChange={(e) => setNewCommentText(e.target.value)}
//                 style={{
//                   marginBottom: 10,
//                   resize: "none",
//                   borderRadius: "8px",
//                 }}
//                 autoFocus
//               />
//               <div className="comment-input-footer">
//                 <Text type="secondary">Page {currentPage}</Text>
//                 <Space>
//                   <Button onClick={() => setCommentPosition(null)}>
//                     Cancel
//                   </Button>
//                   <Button
//                     type="primary"
//                     onClick={handleAddComment}
//                     disabled={!newCommentText.trim()}
//                   >
//                     Add Comment
//                   </Button>
//                 </Space>
//               </div>
//             </div>
//           )}

//           <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
//             <Viewer
//               fileUrl={fileUrl}
//               plugins={[
//                 pageNavigationPluginInstance,
//                 zoomPluginInstance,
//                 searchPluginInstance,
//                 thumbnailPluginInstance,
//               ]}
//               defaultScale={1}
//               onDocumentLoad={handleDocumentLoad}
//               onPageChange={handlePageChange}
//               theme={{
//                 theme: "auto",
//               }}
//               renderError={(error) => (
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     height: "100%",
//                     backgroundColor: "#fff1f0",
//                     color: "#cf1322",
//                     padding: "20px",
//                     textAlign: "center",
//                   }}
//                 >
//                   <div>
//                     <p>Unable to load PDF document</p>
//                     <p>{error.message}</p>
//                     <Button
//                       type="primary"
//                       onClick={() => window.location.reload()}
//                     >
//                       Reload
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             />
//           </Worker>
//         </div>
//       </div>

//       {/* Comment Modal */}
//       {isCommentModalVisible && currentModalComment && (
//         <Modal
//           title="Comment Details"
//           open={isCommentModalVisible}
//           onCancel={closeCommentModal}
//           footer={[
//             <Button
//               key="delete"
//               type="text"
//               danger
//               onClick={() => {
//                 deleteComment(currentModalComment.id);
//                 closeCommentModal();
//               }}
//             >
//               Delete
//             </Button>,
//             <Button key="close" onClick={closeCommentModal}>
//               Close
//             </Button>,
//           ]}
//         >
//           <div>
//             <Text strong>Page {currentModalComment.page}</Text>
//             <Divider />
//             <Text>{currentModalComment.text}</Text>
//             <div style={{ marginTop: 10, color: "rgba(0,0,0,0.45)" }}>
//               <Text type="secondary">
//                 Added on:{" "}
//                 {new Date(currentModalComment.timestamp).toLocaleString()} user
//                 x
//               </Text>
//             </div>
//           </div>
//         </Modal>
//       )}

//       <style jsx global>{`
//         .pdf-viewer-modal .ant-modal-content {
//           padding: 0 !important;
//         }

//         .pdf-viewer-modal .ant-modal-content {
//           // background-color: #2a2a2a;
//         }
//         .rpv-thumbnail__items--selected .rpv-thumbnail__item {
//           background-color: #8ab4f8;
//         }
//         .pdf-viewer-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 24px;
//           // background-color: #333;
//           border-bottom: 1px solid #404040;
//         }

//         .header-section {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .document-title {
//           // color: rgba(255, 255, 255, 0.85);
//           max-width: 300px;
//         }

//         .header-btn {
//           color: rgba(255, 255, 255, 0.65) !important;
//         }

//         .header-btn:hover {
//           color: #1890ff !important;
//           background-color: rgba(255, 255, 255, 0.08) !important;
//         }

//         .search-bar {
//           padding: 12px 24px;
//           background-color: #404040;
//           border-bottom: 1px solid #555;
//         }

//         .pdf-content-container {
//           display: flex;
//           flex: 1;
//           overflow: hidden;
//           // background-color: #1a1a1a;
//         }

//         .thumbnail-sidebar {
//           width: 200px;
//           border-right: 1px solid #404040;
//           // background-color: #262626;
//           overflow-y: auto;
//         }

//         .pdf-viewer {
//           flex: 1;
//           overflow: hidden;
//         }

//         .loading-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background-color: rgba(0, 0, 0, 0.6);
//           z-index: 1000;
//         }

//         .comment-input-container {
//           position: absolute;
//           width: 350px;
//           background-color: white;
//           padding: 15px;
//           border-radius: 12px;
//           box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12),
//             0 3px 6px rgba(0, 0, 0, 0.08);
//           z-index: 1000;
//           transform: translate(-50%, -50%);
//           border: 1px solid rgba(0, 0, 0, 0.06);
//           transition: all 0.3s ease;
//         }

//         .comment-input-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 15px;
//           padding-bottom: 10px;
//           border-bottom: 1px solid rgba(0, 0, 0, 0.06);
//         }

//         .comment-input-footer {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-top: 15px;
//           padding-top: 10px;
//           border-top: 1px solid rgba(0, 0, 0, 0.06);
//         }

//         .comments-sidebar {
//           background-color: white;
//           border-left: 1px solid #e8e8e8;
//           overflow-y: auto;
//         }

//         .comments-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//           border-bottom: 1px solid #e8e8e8;
//           padding-bottom: 10px;
//         }

//         .comment-item {
//           background-color: #f5f5f5;
//           border-radius: 8px;
//           padding: 12px;
//           margin-bottom: 12px;
//         }

//         .comment-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 8px;
//         }

//         .no-comments {
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           height: 100px;
//           color: #8c8c8c;
//           text-align: center;
//         }
//       `}</style>
//     </Modal>
//   );
// };

// export default PDFViewer;
import React from 'react'

function PDFViewer() {
  return (
    <div></div>
  )
}

export default PDFViewer