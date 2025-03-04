"use client";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, useDisclosure} from "@heroui/react";
import { FaEllipsisVertical } from "react-icons/fa6";
import DeleteModal from "./deleteModal";
import { User } from "./types";
import EditModal from "./editUserModal";

export default function ActionButton({user,deleteUser,editUser}:{user:User,deleteUser: (userId: string) => Promise<void>,editUser: (updatedUser: User) => Promise<null | undefined>}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();

  return (
    <>
    <DeleteModal isOpen={isOpen} onOpenChange={onClose} userName={user.first_name+" "+user.last_name} id={user.id} deleteUser={deleteUser}/>
    <EditModal editUser={editUser} isOpen={isOpenEdit} onOpenChange={onCloseEdit} user={user}/>

    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly><FaEllipsisVertical size={20} color="white"/></Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="edit" className="text-dark_blue " onPress={onOpenEdit} >Edit user</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger" onPress={()=>onOpen()}>
          Delete user
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    </>
  );
}