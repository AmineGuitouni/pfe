// Basic structure for a file or folder item
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string; // Full path or relative path
  size?: number; // Size in bytes (optional for folders)
  createdAt: Date | string; // ISO string or Date object
  modifiedAt: Date | string; // ISO string or Date object
  ownerId?: string; // Optional: ID of the owner
  // Add other relevant properties as needed, e.g., permissions, shared status
}

// Type for the context state and functions
export interface FilesContextType {
  files: FileItem[]; // List of files/folders in the current view
  currentPath: string; // The current directory path being viewed
  selectedFile: FileItem | null; // The currently selected item
  isLoading: boolean; // Loading state for fetching data
  error: Error | null; // Error state
  searchTerm: string; // Current search term
  setSearchTerm: (term: string) => void; // Function to update search term
  selectFile: (file: FileItem | null) => void; // Function to select an item
  navigateToPath: (path: string) => void; // Function to change directory
}