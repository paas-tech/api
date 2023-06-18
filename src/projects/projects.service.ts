import { Injectable } from '@nestjs/common';
import { NewProject } from './interfaces/new-project';
import { Project } from './interfaces/project';

@Injectable()
export class ProjectsService {
  private projects: Project[] = [];

  create(project: Project): NewProject {
    this.projects.push(project);
    return {
        name: project.name,
        uuid: (this.projects.length - 1).toString()
    };
  }

  findOne(uuid: string): Project {
    return this.projects[uuid];
  }

  findAll(): Project[] {
    return this.projects;
  }

  delete(uuid: string) {
    this.projects.splice(Number(uuid), 1);
  }
}