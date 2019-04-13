export interface Item {
  id?: number;
  date?: string;
  uuid: string;
  text: string;
  addedBy: string;
  checked: boolean;
  checkedBy?: string;
  archived: boolean;
  position: number;
}
