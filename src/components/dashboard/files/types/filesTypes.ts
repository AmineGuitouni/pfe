// Interface for Folders
export interface FolderItem {
  type: 'folder';
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  owner_id: string;
}

export interface FileItem {
  type: 'file';
  id: string;
  name: string;
  folder_id: string | null;
  size: number;
  created_at: string;
  owner_id: string;
}
