"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Chip,
    Spinner,
    ScrollShadow,
} from "@heroui/react";
import { PanelRightOpen, MessageSquare, Clock, Calendar } from "lucide-react";
import { toast } from "react-toastify";

interface ChatSession {
    id: string;
    name: string;
    mode: string;
    created_at: string;
}

interface ListSessionsResponse {
    data?: {
        sessions: ChatSession[];
    };
    error?: string;
}

export default function HistoryModal() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: session } = useSession();
    const { company } = useParams();
    const router = useRouter();
    
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = useCallback(async () => {
        if (!session?.user?.id || !company) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/v1/${session.user.id}/companies/${company}/command-center/sessions/list`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }

            const data: ListSessionsResponse = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            setSessions(data.data?.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, company]);

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen, fetchSessions]);

    const handleSessionClick = (sessionId: string, mode: string) => {
        router.push(`/dashboard/${company}/command-center/${mode}/${sessionId}`);
        onOpenChange();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getModeColor = (mode: string) => {
        return mode === 'chat' ? 'success' : 'primary';
    };

    return (
        <>
            <button
                onClick={onOpen}
                className="p-2 rounded-md text-light_blue hover:bg-light_blue-500/20 transition-colors"
                title="View Chat History"
            >
                <PanelRightOpen size={18} />
            </button>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                radius="sm"
                size="2xl"
                classNames={{
                    base: "bg-modal_bg border rounded-lg border-white/20",
                    header: "text-light_blue border-b border-white/20",
                    body: "pt-6",
                    closeButton: "text-white/60 hover:text-white/80"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <MessageSquare size={20} />
                                AI Chat History
                            </ModalHeader>
                            
                            <ModalBody>
                                <ScrollShadow className="max-h-[60vh]" hideScrollBar>
                                    {loading ? (
                                        <div className="flex justify-center items-center py-8">
                                            <Spinner 
                                                size="lg" 
                                                color="primary" 
                                                classNames={{
                                                    circle1: "border-b-light_blue-500",
                                                    circle2: "border-b-light_blue-500"
                                                }}
                                            />
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare size={48} className="mx-auto text-white/40 mb-4" />
                                            <p className="text-white/60 text-lg mb-2">No chat history found</p>
                                            <p className="text-white/40 text-sm">
                                                Start a conversation to see your chat sessions here
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessions.map((chatSession) => (
                                                <div
                                                    key={chatSession.id}
                                                    onClick={() => handleSessionClick(chatSession.id, chatSession.mode)}
                                                    className="bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/10 hover:border-light_blue-500/40 cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-white font-medium truncate pr-2 group-hover:text-light_blue-300 transition-colors">
                                                            {chatSession.name}
                                                        </h3>
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={getModeColor(chatSession.mode)}
                                                            classNames={{
                                                                base: "bg-light_blue-500/20 text-light_blue-300",
                                                                content: "text-xs font-semibold"
                                                            }}
                                                        >
                                                            {chatSession.mode.toUpperCase()}
                                                        </Chip>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-white/50 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            <span>{formatDate(chatSession.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{new Date(chatSession.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollShadow>
                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    Close
                                </Button>
                                {sessions.length > 0 && (
                                    <Button
                                        onPress={fetchSessions}
                                        isLoading={loading}
                                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                                    >
                                        Refresh
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}