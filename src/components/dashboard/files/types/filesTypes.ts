// Interface for Folders
export interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  color?: string | null;
  isPublic?: boolean
}

export interface FileItem {
  type: string;
  id: string;
  name: string;
  folder_id: string | null;
  size: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  isShared?: boolean
}

export interface StorageSearchParams {
  folders: {
    id: string,
    name: string
  }[],
}

export type AccessLevel = 'viewer' | 'editor'

export interface FileUserAccessItem {
  user:{
    userId: string;
    fullName: string; 
    email: string;
  }
  file_id: string;
  access_level: AccessLevel;
}