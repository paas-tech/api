import { SetMetadata } from '@nestjs/common';

export const ADMIN_KEY = 'isAdmin';
export const AdminOnly = (isAdmin = true) => SetMetadata(ADMIN_KEY, isAdmin);
