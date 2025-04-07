"use client";
import { motion } from 'framer-motion';
import { CiEdit } from 'react-icons/ci';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';
import { TbFolder } from 'react-icons/tb';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from '@heroui/react';
import { formatShortDate } from '@/lib/utils';
import { FolderItem } from '../types/filesTypes';

const variants = {
    initial: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
    }
};

export default function FolderComponent({ folder, index }: { folder: FolderItem; index: number }) {

    return (
        <>
            <motion.div
                variants={variants}
                initial={index < 3 ? "visible" : "initial"}
                animate="visible"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 h-[170px] sm:w-[300px] w-full rounded-xl border border-light_blue-500/20 shadow-lg flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
                <div className="flex justify-between items-center w-full mb-5 flex-shrink-0">
                    <TbFolder size={35} className="text-light_blue-500" />
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light" color="default">
                                <HiOutlineDotsVertical size={20} className="text-light_blue-500" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="actions">
                            <DropdownItem key="edit" startContent={<CiEdit size={20} />}>
                                Edit Folder
                            </DropdownItem>
                            <DropdownItem key="delete" startContent={<MdDelete size={20} />} className="text-danger" color="danger" >
                                Delete Folder
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <p className="text-sm font-semibold text-light_blue-500 line-clamp-2">{folder.name}</p>
                <hr className="my-4" />
                <p className="text-sm font-semibold text-gray-300 mb-2">{formatShortDate(folder.created_at)}</p>
            </motion.div>
        </>
    );
}

export function FolderSkeleton({ index, loading }: { index: number; loading: boolean }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate={loading ? "visible" : "initial"}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 h-[170px] sm:w-[300px] w-full rounded-xl border border-light_blue-500/20 shadow-lg flex-shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-200"
        >
            <div className="flex justify-between items-center w-full mb-5 flex-shrink-0">
                <TbFolder size={35} className="text-light_blue-500" />
                <Skeleton className="size-6 rounded-lg" />
            </div>
            <Skeleton className="w-16 h-4 rounded-lg" />
            <hr className="my-4" />
            <Skeleton className="w-24 h-2 rounded-lg" />
        </motion.div>
    );
}