import { SetMetadata } from '@nestjs/common';

export const ADMIN_KEY = 'isAdmin';
export const AdminOnly = (isAdmin: boolean = true) => SetMetadata(ADMIN_KEY, isAdmin);