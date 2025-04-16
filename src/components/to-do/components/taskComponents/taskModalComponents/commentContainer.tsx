import CommentItem from "@/components/to-do/hooks/commentsComponents/commentItem";
import { Chip, Divider, ModalBody, Skeleton } from "@heroui/react";
import { Disclosure, Transition } from '@headlessui/react'; // Import Disclosure and Transition from headlessui
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import AddCommentComponent from './addCommentComponent';
import useComments from './hooks/useComments';
import { useSession } from "next-auth/react";

export default function CommentContainer({task_id,project_id}: {task_id: string,project_id: string}) {
    
    const { comments, loading, AddComment, deleteComment, editComment , LikeDislikeComment } = useComments({ task_id, project_id });
    const { data: session } = useSession();

    // Simple inline skeleton component
    const CommentSkeleton = () => (
        <div className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
            <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 rounded bg-gray-700" />
                <Skeleton className="h-4 w-3/4 rounded bg-gray-700" />
                <Skeleton className="h-4 w-1/2 rounded bg-gray-700" />
            </div>
        </div>
    );


    return (
        <ModalBody className="p-4 md:p-6 bg-modal_bg text-white rounded-b-lg flex flex-col ">

            <h3 className="text-lg font-semibold text-light_blue border-b border-light_blue-500/20 pb-2 mb-4"> {/* Adjusted mb */}
                Comments
            </h3>

            {/* Collapsible Add Comment Section */}
            {session?.user && (
                <Disclosure as="div" className="mb-4">
                    {({ open }: { open: boolean }) => ( // Added type for open
                        <>
                            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-light_blue-500/10 px-4 py-2 text-left text-sm font-medium text-light_blue hover:bg-light_blue-500/20 focus:outline-none focus-visible:ring focus-visible:ring-light_blue-500 focus-visible:ring-opacity-75">
                                <span>Add a comment</span>
                                <ChevronUpIcon
                                    className={`${
                                        open ? 'rotate-180 transform' : ''
                                    } h-5 w-5 text-light_blue transition-transform duration-200`}
                                />
                            </Disclosure.Button>
                            <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                            >
                                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                                    <AddCommentComponent
                                        first_name={session.user.first_name}
                                        last_name={session.user.last_name}
                                        addFunction={AddComment}
                                    />
                                </Disclosure.Panel>
                            </Transition>
                        </>
                    )}
                </Disclosure>
            )}
            <div className='w-full relative flex justify-center items-center'>
                <Divider className="bg-light_blue-500/20 h-[1px] absolute" />
                <Chip className='bg-modal_bg border-1 border-light_blue-500/20 text-white/50'>
                    {loading ? 'Loading...' : `All comments (${comments.filter(comment => comment.reply_to === null).length})`}
                </Chip>
            </div>

            {/* Comments List or Skeletons */}
            <div className="flex flex-col gap-4 mt-4 overflow-y-auto h-[290px]"> {/* Added mt-4 for spacing */}
                {loading ? (
                    <>
                        <CommentSkeleton />
                        <CommentSkeleton />
                        {/* <CommentSkeleton /> */}
                    </>
                ) : comments.length > 0 ? (
                    comments.map((comment) => ( comment.reply_to === null &&
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isOwner={comment.user.id === session?.user.id} 
                            replies={comments.filter((reply) => reply.reply_to === comment.id)} 
                            deleteFunction={deleteComment}
                            editFunction={editComment}
                            LikeDislikeComment={LikeDislikeComment} // Corrected prop name to match CommentItem
                            addFunction={AddComment} // Pass the AddComment function to CommentItem if needed
                        />
                    ))
                ) : (
                    <p className="text-sm text-light_blue/80 text-center">
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </ModalBody>
    );
}