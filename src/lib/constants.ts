const groupsPermission:string[] = [
    'groups:create',
    'groups:read',
    'groups:update',
    'groups:delete',
]

const projectsPermission:string[] = [
    'projects:create',
    'projects:read',
    'projects:update',
    'projects:delete',
]

const storagePermission:string[] = [
    'storage:create',
    'storage:read',
    'storage:update',
    'storage:delete',
]

const usersManagementPermission:string[] = [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
]

export const APP_PERMISSIONS:string[] = [
    ...groupsPermission,
    ...projectsPermission,
    ...storagePermission,
    ...usersManagementPermission
];