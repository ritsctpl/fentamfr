export interface GroupMember {
  item: string;
  itemVersion: string;
}

export interface ItemGroupData {
  site: string;
  itemGroup: string;
  groupDescription: string;
  unitPrice: number;
  groupMemberList: GroupMember[];
  userId: string;
}

export const defaultGroupData: ItemGroupData = {
 
  site: '',
  itemGroup: '',
  groupDescription: '',
  unitPrice: 0,
  groupMemberList: [],
  userId: ''
};
