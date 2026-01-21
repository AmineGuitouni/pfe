"use client";

import { useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
} from '@heroui/react';
import { MdCheck, MdOutlineContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';

interface ShareLinkModalProps {
    isOpen: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    fileId: string;
    fileName: string;
    getFileDownloadLink?: (fileId: string, expiresIn?: number) => Promise<string>;
}

export default function ShareLinkModal({ isOpen, onOpenChange, fileId, fileName, getFileDownloadLink }: ShareLinkModalProps) {
    const [expiresIn, setExpiresIn] = useState(''); // Store as string for input flexibility
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerateLink = useCallback(async () => {
        setIsGeneratingLink(true);
        setGeneratedLink(null);
        setLinkError(null);
        setIsCopied(false);
        if(!getFileDownloadLink){
            return
        }
        try {
            // Parse expiresIn string to number. Undefined if empty or invalid.
            const expirySeconds = expiresIn.trim() ? parseInt(expiresIn.trim(), 10) : undefined;
            const validExpiry = (expirySeconds !== undefined && !isNaN(expirySeconds) && expirySeconds > 0) ? expirySeconds : undefined;

            const url = await getFileDownloadLink(fileId, validExpiry);
            setGeneratedLink(url);
        } catch (error: any) {
            console.error("Failed to generate share link:", error);
            const message = error.message || "Failed to generate link";
            setLinkError(message);
            toast.error(message);
        } finally {
            setIsGeneratingLink(false);
        }
    }, [fileId, expiresIn, getFileDownloadLink]);

    const handleCopyLink = useCallback(() => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink)
            .then(() => {
                setIsCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                toast.error("Failed to copy link.");
            });
    }, [generatedLink]);

    // Reset state when modal closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setExpiresIn('');
            setGeneratedLink(null);
            setLinkError(null);
            setIsGeneratingLink(false);
            setIsCopied(false);
        }
        onOpenChange?.(open);
    };


    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleOpenChange} // Use custom handler
            radius="sm"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20 dark", // Added dark class
                header: "text-light_blue border-b border-white/20", // Use light_blue from design sheet
                body: "pt-6 pb-4", // Adjusted padding
                closeButton: "text-white/60 hover:text-white/80"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Generate Share Link</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-gray-300">Generate a temporary link to share <span className="font-semibold text-light_blue">{fileName}</span>.</p>
                                <Input
                                    type="number"
                                    variant="bordered"
                                    label="Expiration Time (seconds)"
                                    placeholder="Optional (e.g., 3600 for 1 hour)"
                                    className="w-full text-white dark"
                                    value={expiresIn}
                                    onChange={(e) => setExpiresIn(e.target.value)}
                                    min="1"
                                    disabled={isGeneratingLink}
                                />

                                {linkError && (
                                    <p className="text-sm text-red-500">{linkError}</p>
                                )}

                                {generatedLink && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            isReadOnly
                                            variant="bordered"
                                            label="Generated Link"
                                            value={generatedLink}
                                            className="w-full text-white dark flex-grow"
                                        />
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            onPress={handleCopyLink}
                                            className="text-light_blue-500 hover:bg-light_blue-500/10 flex-shrink-0"
                                            aria-label="Copy link"
                                            title="Copy link"
                                        >
                                            {isCopied ? <MdCheck className="w-5 h-5 text-green-500" /> : <MdOutlineContentCopy size={20} />}
                                        </Button>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 w-full mt-4">
                                    <Button
                                        variant="light"
                                        onPress={onClose}
                                        className="text-white/60 dark hover:text-white hover:bg-white/10"
                                        disabled={isGeneratingLink}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        isLoading={isGeneratingLink}
                                        isDisabled={isGeneratingLink}
                                        onPress={handleGenerateLink}
                                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue" // Style from design sheet
                                    >
                                        {generatedLink ? "Regenerate Link" : "Generate Link"}
                                    </Button>
                                </div>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}