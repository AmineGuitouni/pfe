"use client";
import { useState } from 'react'; // Import useState
import { motion } from 'framer-motion';
import {
  BsFiletypeCsv,
  BsFiletypeTxt,
  BsFiletypeDoc,
  BsFiletypeXls,
  BsFiletypePpt,
  BsFiletypeExe,
  BsFiletypeJs,
  BsFiletypeTsx,
  BsFiletypeJson,
  BsFiletypeHtml,
  BsFiletypeCss,
  BsFiletypeMp3,
} from 'react-icons/bs';
import {
  CiEdit,
  CiFileOn,
} from 'react-icons/ci';
import {
  FaRegFileImage,
  FaRegFileVideo,
} from 'react-icons/fa';
import { FaRegFilePdf } from 'react-icons/fa6';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  useDisclosure,
  Spinner,
  Tooltip,
} from '@heroui/react';
import { FileItem } from '../types/filesTypes';
import { formatShortDate } from '@/lib/utils';
import { formatBytes } from '@/lib/utils/formatBytes';
import EditModal from './editModal';
import DeleteModal from './deleteModal';
import { useFilesContext } from '../hooks/useFilesContext'; // Import context hook
import { toast } from 'react-toastify'; // Import toast
import ImageLoader from './imageLoader';

const variants = {
    initial: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
    },
};

function getIcon(type: string, size?: number, className?: string) {
    // Document types
    if (type === "application/pdf") return <FaRegFilePdf size={size} className={className} />;
    if (type === "text/plain") return <BsFiletypeTxt size={size} className={className} />;
    if (type === "text/csv" || type === "text/comma-separated-values") return <BsFiletypeCsv size={size} className={className} />;
    if (type.includes("word") || type === "application/msword" || type.includes("document")) return <BsFiletypeDoc size={size} className={className} />;
    if (type.includes("excel") || type.includes("spreadsheet")) return <BsFiletypeXls size={size} className={className} />;
    if (type.includes("powerpoint") || type.includes("presentation")) return <BsFiletypePpt size={size} className={className} />;
    
    // Archive/executable types
    if (type.includes("zip") || type.includes("compressed") || type.includes("application/x-zip")) return <BsFiletypeExe size={size} className={className} />;
    
    // Code files
    if (type.includes("javascript")) return <BsFiletypeJs size={size} className={className} />;
    if (type.includes("typescript")) return <BsFiletypeTsx size={size} className={className} />;
    if (type.includes("json")) return <BsFiletypeJson size={size} className={className} />;
    if (type.includes("html")) return <BsFiletypeHtml size={size} className={className} />;
    if (type.includes("css")) return <BsFiletypeCss size={size} className={className} />;
    
    // Media types
    if (type.startsWith("image")) return <FaRegFileImage size={size} className={className} />;
    if (type.startsWith("video")) return <FaRegFileVideo size={size} className={className} />;
    if (type.startsWith("audio")) return <BsFiletypeMp3 size={size} className={className} />;
    
    // Default fallback
    return <CiFileOn size={size} className={className} />;
}

export default function FileComponent({ file, index }: { file: FileItem; index: number }) {

    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();
    const { getFileDownloadLink } = useFilesContext(); // Get function from context
    const [isLinkLoading, setIsLinkLoading] = useState(false); // Add loading state for link fetching

    return (
        <>
            <EditModal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} object={file} />
            <DeleteModal isOpen={isOpenDelete} onOpenChange={onOpenChangeDelete}  object={file} />

            {file.type.startsWith("image") ? 
                <Tooltip content={<ImageLoader file_id={file.id}/>}>
                    <FileCard 
                        file={file} 
                        index={index} 
                        isLinkLoading={isLinkLoading} 
                        setIsLinkLoading={setIsLinkLoading} 
                        getFileDownloadLink={getFileDownloadLink} 
                        onOpenEdit={onOpenEdit} 
                        onOpenDelete={onOpenDelete}
                    />
                </Tooltip> :
                <FileCard 
                    file={file} 
                    index={index} 
                    isLinkLoading={isLinkLoading} 
                    setIsLinkLoading={setIsLinkLoading} 
                    getFileDownloadLink={getFileDownloadLink} 
                    onOpenEdit={onOpenEdit} 
                    onOpenDelete={onOpenDelete}
                />
            }
        </>
    );
}


function FileCard({
    file,
    index,
    isLinkLoading,
    setIsLinkLoading,
    getFileDownloadLink,
    onOpenEdit,
    onOpenDelete
}: {
    file: FileItem;
    index: number;
    isLinkLoading: boolean;
    setIsLinkLoading: React.Dispatch<React.SetStateAction<boolean>>;
    getFileDownloadLink: (fileId: string) => Promise<string>;
    onOpenEdit: () => void;
    onOpenDelete: () => void;
}){
    return (
        <motion.div
            variants={variants}
            initial={index < 3 ? "visible" : "initial"}
            animate="visible"
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-4 h-[170px] col-span-1 w-full rounded-xl border border-light_blue-500/20 shadow-lg flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200 relative ${isLinkLoading ? 'opacity-70 pointer-events-none' : ''}`} // Add relative positioning and loading styles
            onClick={async () => { // Add onClick handler
                if (isLinkLoading) return; // Prevent multiple clicks
                setIsLinkLoading(true);
                try {
                    const url = await getFileDownloadLink(file.id);
                    window.open(url, '_blank', 'noopener,noreferrer'); // Open in new tab
                } catch (error: any) {
                    console.error("Failed to get download link:", error);
                    toast.error(`Failed to open file: ${error.message || 'Unknown error'}`);
                } finally {
                    setIsLinkLoading(false);
                }
            }}
        >
            <div className="flex justify-between items-center w-full mb-5 flex-shrink-0">
                {getIcon(file.type, 35, "text-light_blue")}
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light" color="default" >
                            <HiOutlineDotsVertical size={20} className="text-light_blue-500" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="actions">
                        <DropdownItem key="edit" startContent={<CiEdit size={20} />} onPress={onOpenEdit} >
                            Edit File
                        </DropdownItem>
                        <DropdownItem key="delete" startContent={<MdDelete size={20} />} className="text-danger" color="danger" onPress={onOpenDelete}>
                            Delete File
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <p className="text-sm font-semibold text-light_blue line-clamp-2">{file.name}</p>
            <hr className="my-3" />
            <div className='flex justify-between items-end'>
                <p className="text-sm font-semibold text-gray-300 mb-2">{formatShortDate(file.created_at)}</p>
                <p className="text-xs font-semibold text-gray-300 mb-2 text-end">{formatBytes(file.size)}</p>
            </div>
            {/* Optional: Add a loading indicator overlay */}
            {isLinkLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl z-10">
                    <Spinner color="primary" size="lg"/>
                </div>
            )}
        </motion.div>
    )
}

export function FileSkeleton({ index, loading }: { index: number; loading: boolean }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate={loading ? "visible" : "initial"}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 h-[170px] sm:w-[300px] w-full rounded-xl border border-light_blue-500/20 shadow-lg flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200"
        >
            <div className="flex justify-between items-center w-full mb-5 flex-shrink-0">
                <Skeleton className="size-[35px] rounded-lg animate-pulse" />
                <Skeleton className="size-8 rounded-lg animate-pulse" />
            </div>
            <Skeleton className="w-3/4 h-4 rounded-lg mb-1 animate-pulse" />
            <Skeleton className="w-1/2 h-4 rounded-lg animate-pulse" />
            <hr className="my-3 border-gray-700" />
            <div className='flex justify-between items-end'>
                 <Skeleton className="w-20 h-3 rounded-lg animate-pulse" />
                 <Skeleton className="w-12 h-3 rounded-lg animate-pulse" />
            </div>
        </motion.div>
    );
}
