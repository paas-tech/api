import { User } from "@prisma/client";


export type SanitizedUser = User | Omit<User, keyof User>;
