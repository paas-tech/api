import { User } from "src/users/interfaces/user";

export interface Project {
    name: string;
    createdAt: Date;
    lastUp: Date;
    author: User;
}