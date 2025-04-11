"use client";
import { motion } from 'framer-motion';
import {
  BsFiletypeCsv,
  BsFiletypeTxt,
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
} from '@heroui/react';
import { FileItem } from '../types/filesTypes';
import { formatShortDate } from '@/lib/utils';
import { formatBytes } from '@/lib/utils/formatBytes';
import EditModal from './editModal';
import DeleteModal from './deleteModal';

const variants = {
    initial: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
    },
};

function getIcon(type: string, size?: number, className?: string) {
    if (type === "application/pdf") return <FaRegFilePdf size={size} className={className} />;
    if (type === "text/plain") return <BsFiletypeTxt size={size} className={className} />;
    if (type.startsWith("image")) return <FaRegFileImage size={size} className={className} />;
    if (type.startsWith("video")) return <FaRegFileVideo size={size} className={className} />;
    if (type === "text/csv") return <BsFiletypeCsv size={size} className={className} />;
    return <CiFileOn size={size} className={className} />;
}

export default function FileComponent({ file, index }: { file: FileItem; index: number }) {

    const { isOpen : isOpenEdit , onOpen : onOpenEdit , onOpenChange : onOpenChangeEdit } = useDisclosure();
    const { isOpen : isOpenDelete , onOpen : onOpenDelete , onOpenChange : onOpenChangeDelete } = useDisclosure();

    return (
        <>
            <EditModal isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} object={file} />
            <DeleteModal isOpen={isOpenDelete} onOpenChange={onOpenChangeDelete}  object={file} />

            <motion.div
                variants={variants}
                initial={index < 3 ? "visible" : "initial"}
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 h-[170px] col-span-1 w-full rounded-xl border border-light_blue-500/20 shadow-lg flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200"
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
            </motion.div>
        </>
    );
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
