import { Comment } from "@/features/to-do/types/type";
import { useCompanyId } from "@/providers/companyIdProvider";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function useComments({task_id,project_id}: {task_id: string,project_id: string}) {
    
    const [comments, setComments ] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)
    const company_id = useCompanyId()
    const {data : session } = useSession()

    const getComments = useCallback(async () => {

        if(!session?.user.id || !company_id) return

        try {
            setLoading(true)
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/comments/list?task_id=${task_id}`)
            if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const {data} = await response.json()
            setComments(data)
        } catch (error) {
            toast.error("Cannot get comments")
            console.log(error)
        }
        finally{
            setLoading(false)
        }
    },[company_id, project_id, session?.user.id, task_id])

    useEffect(()=>{
        getComments()
    },[getComments])

    const AddComment = async (body: string,first_name: string,last_name: string,reply_to?:string)=>{
        if(!session?.user.id || !company_id) return
        if(!body){
            toast.error("Comment cannot be empty")
        }
        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/comments/new?`
            ,{
                method: "POST",
                body: JSON.stringify({
                    comment:{
                        task_id,
                        body,
                        user_id: session.user.id,
                        reply_to: reply_to || null

                    }
                })
            }
            )
            if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const {data} = await response.json()
            const newComment = {
                id: data.id,
                body,
                user: {
                    id: session.user.id,
                    first_name,
                    last_name
                },
                created_at: data.created_at,
                task_id: data.user,
                likes: 0,
                dislikes: 0,
                ownerReact : null,
                reply_to : reply_to || null
            }
            setComments(prev => prev ? [ newComment , ...prev] : [newComment])
        } catch (error) {
            toast.error("Cannot get comments")
            console.log(error)
        }

    }

    const deleteComment = async (comment_id: string) => {
        if (!session?.user.id || !company_id) {
            toast.error("Authentication error. Cannot delete comment.");
            return;
        }

        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/comments/${comment_id}/delete`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }
            
            setComments(prev => prev.filter(comment => comment.id !== comment_id));
            toast.success("Comment deleted successfully");

        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const editComment = async (comment_id: string, newBody: string) => {
        if (!session?.user.id || !company_id) {
            toast.error("Authentication error. Cannot edit comment.");
            return;
        }
        if (!newBody.trim()) {
            toast.error("Comment body cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/comments/${comment_id}/edit`, {
                method: "PUT", // Using PATCH for partial update
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: newBody
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            setComments(prev =>
                prev.map(comment =>
                    comment.id === comment_id ? { ...comment, body: newBody } : comment
                )
            );
            toast.success("Comment updated successfully");

        } catch (error) {
            console.error("Error editing comment:", error);
            toast.error(`Failed to edit comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const LikeDislikeComment = async (comment_id: string ,like_dislike : string) => {
        
        if (!session?.user.id || !company_id) {
            toast.error("Authentication error. Cannot edit comment.");
            return;
        }

        if(!comment_id) return 

        if (!like_dislike) {
            toast.error("not like or dislike");
            return;
        }

        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/to-do/${project_id}/comments/${comment_id}/edit/add_like_dislike`, {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    like_dislike
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }


            setComments(prev =>
                prev.map(comment => {
                    if (comment.id === comment_id) {
                        const wasLiked = comment.ownerReact === "like";
                        const wasDisliked = comment.ownerReact === "dislike";
                        let newLikes = comment.likes;
                        let newDislikes = comment.dislikes;
                        let newOwnerReact: "like" | "dislike" | null = comment.ownerReact; // Start with current

                        if (like_dislike === "like") {
                            newOwnerReact = "like";
                            // Increment likes only if it wasn't already liked
                            newLikes = wasLiked ? comment.likes : comment.likes + 1;
                            // Decrement dislikes if it was previously disliked
                            newDislikes = wasDisliked ? comment.dislikes - 1 : comment.dislikes;
                        } else if (like_dislike === "dislike") {
                            newOwnerReact = "dislike";
                            // Increment dislikes only if it wasn't already disliked
                            newDislikes = wasDisliked ? comment.dislikes : comment.dislikes + 1;
                            // Decrement likes if it was previously liked
                            newLikes = wasLiked ? comment.likes - 1 : comment.likes;
                        } else if (like_dislike === "remove") {
                            newOwnerReact = null;
                            // Decrement likes if it was previously liked
                            newLikes = wasLiked ? comment.likes - 1 : comment.likes;
                            // Decrement dislikes if it was previously disliked
                            newDislikes = wasDisliked ? comment.dislikes - 1 : comment.dislikes;
                        }

                        // Ensure counts don't go below zero
                        newLikes = Math.max(0, newLikes);
                        newDislikes = Math.max(0, newDislikes);

                        return { ...comment, likes: newLikes, dislikes: newDislikes, ownerReact: newOwnerReact };
                    }
                    return comment;
                })
            );
        } catch (error) {
            console.error("Error editing comment:", error);
            toast.error(`Failed to edit comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return {comments, setComments, loading, AddComment, deleteComment, editComment , LikeDislikeComment} 
}