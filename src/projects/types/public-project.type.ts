import { Project } from "@prisma/client";

export type PublicProject = Project | Omit<Project, keyof Project>;
