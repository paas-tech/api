import { SshKey } from '@prisma/client';

export type SanitizedSshKey = SshKey | Omit<SshKey, keyof SshKey>;
