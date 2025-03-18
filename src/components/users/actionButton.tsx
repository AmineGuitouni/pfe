"use client";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, useDisclosure} from "@heroui/react";
import { FaEllipsisVertical } from "react-icons/fa6";
import DeleteModal from "./deleteModal";
import { User } from "./types/types";
import EditModal from "./editUserModal";
import InfoModal from "./infoModal";
import { TbFileCv } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";

export default function ActionButton({user,deleteUser,editUser,company_id}:{user:User,deleteUser: (userId: string) => Promise<void>,editUser: (updatedUser: User) => Promise<null | undefined>,company_id:string}) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
    const { isOpen: isOpenMore, onOpen: onOpenMore, onClose: onCloseMore } = useDisclosure();

  return (
    <>
    <DeleteModal isOpen={isOpen} onOpenChange={onClose} userName={user.first_name+" "+user.last_name} id={user.id} deleteUser={deleteUser}/>
    <EditModal editUser={editUser} isOpen={isOpenEdit} onOpenChange={onCloseEdit} user={user}/>
    <InfoModal isOpen={isOpenMore} onOpenChange={onCloseMore} user={user} company_id={company_id}/>
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly><FaEllipsisVertical size={20} color="white"/></Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
      <DropdownItem key="select" className="text-dark_blue " onPress={onOpenMore} startContent={<TbFileCv size={20} className="text-dark_blue"/>}>CV informations</DropdownItem>
        <DropdownItem key="edit" className="text-dark_blue " onPress={onOpenEdit} startContent={<BiEdit size={20} className="text-dark_blue"/>} >Edit user</DropdownItem>
        <DropdownItem key="delete" className="text-danger hover:text-white transition-all ease-linear" color="danger" startContent={<MdDeleteForever size={20} />} onPress={()=>onOpen()}>
          Delete user
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    </>
  );
}