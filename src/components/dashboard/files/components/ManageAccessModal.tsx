"use client";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
} from '@heroui/react';
import { FaUserShield } from 'react-icons/fa';
import ManageUserAccess from './ManageUserAccess';

interface ManageAccessModalProps {
    isOpen: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    fileId: string;
    fileName: string;
    companyId: string;
}

export default function ManageAccessModal({
    isOpen,
    onOpenChange,
    fileId,
    fileName,
    companyId,
}: ManageAccessModalProps) {
    
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            radius="sm"
            size="2xl"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20 dark",
                header: "text-light_blue border-b border-white/20",
                body: "pt-4 pb-4 max-h-[70vh]",
                closeButton: "text-white/60 hover:text-white/80"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <FaUserShield /> Manage Access for {fileName}
                        </ModalHeader>
                        <ModalBody>
                            <ManageUserAccess
                                onClose={onClose}
                                fileId={fileId}
                                companyId={companyId}
                            />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}