import { Project } from "@prisma/client";

export type SanitizedProject = Project | Omit<Project, keyof Project>;
