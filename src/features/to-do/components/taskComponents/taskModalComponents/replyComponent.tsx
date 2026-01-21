
import { Comment } from "@/features/to-do/types/type";
import { Button } from "@heroui/react";
import React, { useState } from "react"; 
import ReplyItem from "./replyItem";

interface ReplyComponentProps {
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  comment: Comment;
  addReply : (body: string, first_name: string, last_name: string, reply_to?: string) => Promise<void>,
  replies : Comment[]; // Optional prop for replies
  editFunction: (comment_id: string, body: string) => void;
  deleteFunction: (comment_id: string) => void;
  LikeDislikeComment: (comment_id: string, like_dislike: string) => void;
}

const ReplyComponent = React.forwardRef<HTMLDivElement, ReplyComponentProps>(
  ({ comment , addReply , replies , editFunction , deleteFunction , LikeDislikeComment }, ref) => { 
    
    const [replyBody, setReplyBody] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handlePostReply = async (e : any) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (!replyBody.trim()) return;
        setLoading(true); // Show loading state
        try{
            await addReply(replyBody, comment.user.first_name, comment.user.last_name, comment.id)
        }
        catch{
            console.log("Error posting reply")
        }
        finally{
            setReplyBody(""); // Clear input
            setLoading(false); // Hide loading state
        }
        
      };
    
    const reversedReplies = [...replies].reverse(); // Reverse the replies for display

      
    return (
      // Forward the ref to the outermost div
      <div ref={ref} className="mt-4 "> {/* Indent reply slightly */}
        {/* We might need user info here if not reusing AddCommentComponent */}
        <form onSubmit={handlePostReply}  className="min-w-0 flex-1">
          <textarea
                     placeholder={`Replying to ${comment.user.first_name}...`}
                     value={replyBody}
                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyBody(e.target.value)}
                     className="w-full border border-light_blue-500/20 bg-white/5 text-white placeholder-gray-400 rounded-lg shadow-sm focus:border-light_blue-500 focus:ring-light_blue-500 sm:text-sm p-2 mb-2"
                     rows={2} // Smaller text area for replies
                 />
                 <div className="flex justify-end">
                     <Button
                         size="sm"
                         isLoading={loading}
                         type="submit"
                         className="bg-light_blue hover:bg-light_blue-600 text-dark_blue px-3 py-1"
                         disabled={!replyBody.trim() || loading} // Disable if empty
                     >
                         Post Reply
                     </Button>
                 </div>
             </form>
             <div className="flex flex-col gap-4 mt-4 "> {/* Added mt-4 for spacing */}
                {
                    reversedReplies .length > 0 ? reversedReplies.map(
                        (reply) => (
                        <ReplyItem
                            key={reply.id}
                            comment={reply}
                            isOwner={reply.user.id === comment.user.id} // Check if the reply is from the same user
                            deleteFunction={deleteFunction}
                            editFunction={editFunction}
                            LikeDislikeComment={LikeDislikeComment}
                        />
                        )
                    ) : <p className="text-sm text-light_blue/80 text-center">No replies yet</p>
                }
             </div>
          </div>
    );
  }
);


ReplyComponent.displayName = "ReplyComponent";

export default ReplyComponent;