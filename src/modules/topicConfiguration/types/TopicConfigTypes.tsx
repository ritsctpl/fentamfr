// export interface ResourceMemberList {
//     resource: string;
// }

// export const defaultResourceMemberList: ResourceMemberList = {
//     resource: ""
// };

export interface TopicConfigurationRequest {
    topicName: string;
    active: boolean;
    apiUrl: string;
}

export const defaultTopicConfigurationRequest: TopicConfigurationRequest = {
   topicName: "",
   active: false,
   apiUrl: "",
};