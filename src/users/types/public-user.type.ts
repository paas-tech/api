import { User } from "@prisma/client";


export type PublicUser = User | Omit<User, keyof User>;
