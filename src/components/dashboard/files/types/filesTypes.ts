// Interface for Folders
export interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  color?: string | null;
}

export interface FileItem {
  type: string;
  id: string;
  name: string;
  folder_id: string | null;
  size: number;
  created_at: string;
  updated_at: string; // Added updated_at field
  owner_id: string;
}

export interface StorageSearchParams {
  folders: {
    id: string,
    name: string
  }[],
}