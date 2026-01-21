"use client"
import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/20/solid'; // Added Like/Dislike Icons
import { User , Button, cn } from '@heroui/react';
import { Comment } from '../../../types/type'; // Adjusted import path



export default function ReplyItem({ comment, isOwner, deleteFunction, editFunction, LikeDislikeComment}: { comment: Comment, isOwner: boolean, deleteFunction: (comment_id: string) => void, editFunction: (comment_id: string, body: string) => void, LikeDislikeComment: (comment_id: string, like_dislike : string) => void,}) { // Corrected prop name and signature

  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(comment.body);
  const [isLiked, setIsLiked] = useState(comment.ownerReact === "like"); // Initialize based on comment data
  const [isDisliked, setIsDisliked] = useState(comment.ownerReact === "dislike"); // Initialize based on comment data


  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleEditClick = () => {
    setEditedBody(comment.body); // Reset edited body to original on entering edit mode
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // No need to reset editedBody here as it's reset in handleEditClick
  };

  const handleSaveClick = () => {
    // Only call edit function if the body actually changed and is not empty
    if (editedBody.trim() !== comment.body && editedBody.trim() !== '') {
      editFunction(comment.id, editedBody.trim());
    }
    setIsEditing(false);
  };

  const handleLikeClick = () => {
    if (!isLiked) {
      setIsLiked(true);
      setIsDisliked(false); // Ensure dislike is off
      LikeDislikeComment(comment.id, "like");
    }
    else {
      setIsLiked(false); 
      LikeDislikeComment(comment.id, "remove"); 
    }
  }

  const handleDislikeClick = () => {
    if (!isDisliked) {
      setIsDisliked(true);
      setIsLiked(false); // Ensure like is off
      LikeDislikeComment(comment.id, "dislike");
    }
    else {
      setIsDisliked(false); 
      LikeDislikeComment(comment.id, "remove");
    }
  }





  return (
    <div className="flex items-start space-x-3 pb-4 border-b border-light_blue-500/20 last:border-b-0 pr-1">
      {/* User Image */}
      <div className="flex-shrink-0">
        <User
          avatarProps={{
            name: comment.user.first_name, // Used for avatar initials
          }}
          className="flex-shrink-0"
          name=""
        />
      </div>

      {/* Comment Content */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-center">
          {/* User Name and Date */}
          <div>
            <p className="text-sm font-medium text-light_blue-500">
              {comment.user.first_name} {comment.user.last_name}
            </p>
            <p className="text-xs text-light_blue">
              {formattedDate}
            </p>
          </div>

          {/* Edit/Delete Dropdown (only if owner and not currently editing) */}
          {isOwner && !isEditing && (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center rounded-full bg-light_blue-500/10 text-light_blue/80 hover:text-light_blue hover:bg-light_blue-500/20 focus:outline-none focus:ring-2 focus:ring-light_blue-500 focus:ring-offset-2 focus:ring-offset-modal_bg p-1">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border-1 border-light_blue-500/20 bg-[#2c373b] shadow-lg ring-1 ring-light_blue-500/10 focus:outline-none">
                  <div > {/* Added py-1 for padding consistency */}
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={handleEditClick}
                          className={`${
                            active ? 'bg-light_blue-500/10 text-light_blue' : 'text-light_blue/80'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          <PencilIcon
                            className="mr-3 h-5 w-5 text-light_blue/50 group-hover:text-light_blue/80"
                            aria-hidden="true"
                          />
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={() => deleteFunction(comment.id)}
                          className={`${
                            active ? 'bg-red-500/10 text-red-400' : 'text-red-500'
                          } group flex w-full items-center px-4 py-2 text-sm`}
                        >
                          <TrashIcon
                            className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-400"
                            aria-hidden="true"
                          />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        {/* Comment Body or Edit Textarea */}
        <div className="mt-1">
          {isEditing ? (
            <div className='space-y-2'>
              <textarea
                  placeholder="Add a comment..."
                  value={editedBody}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedBody(e.target.value)}
                  className="w-full border border-light_blue-500/20 bg-white/5 text-white placeholder-gray-400 rounded-lg shadow-sm focus:border-light_blue-500 focus:ring-light_blue-500 sm:text-sm p-2 mt-2" // Use design colors
                  rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="light"
                  size="sm"
                  onPress={handleCancelClick}
                  className="text-light_blue/80 hover:text-light_blue px-3 py-1" // Adjusted padding
                >
                   Cancel
                </Button>
                <Button
                  size="sm"
                  onPress={handleSaveClick}
                  className="bg-light_blue hover:bg-light_blue-600 text-dark_blue px-3 py-1" // Adjusted padding
                  disabled={editedBody.trim() === '' || editedBody.trim() === comment.body} // Disable save if empty or unchanged
                >
                   Save
                </Button>
              </div>
            </div>
          ) : (
            <div className='w-full flex flex-col'>
              <p className="text-sm mt-1 text-white whitespace-pre-wrap break-words">
                {comment.body}
              </p>
              <div className=" flex items-center space-x-4 text-sm justify-end mt-2"> {/* Added mt-2 for spacing */}
                <button
                  title="Like"
                  className={cn("flex items-center space-x-1 text-light_blue hover:text-light_blue-400 hover:scale-105 transition-all ease-linear", isLiked && "text-success-600")} // Use isLiked and a different color (e.g., green)
                  onClick={() => {
                    handleLikeClick()
                  }}
                >
                  <HandThumbUpIcon className="h-5 w-5" />
                  <span>{comment.likes}</span>
                </button>
                <button
                  title="Dislike"
                  className={cn("flex items-center space-x-1 text-light_blue hover:text-light_blue-400 hover:scale-105 transition-all ease-linear",isDisliked && "text-red-600")}
                  onClick={() => {
                    handleDislikeClick()
                  }}
                >
                  <HandThumbDownIcon className="h-5 w-5" />
                  <span>{comment.dislikes}</span> 
                </button>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};
