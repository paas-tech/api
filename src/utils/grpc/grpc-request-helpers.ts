import { RepositoryRequest } from 'paastech-proto/types/proto/git-repo-manager';

// Helper to create a RepositoryRequest object
export function createRepositoryRequest(path: string): RepositoryRequest {
  return {
    repository_path: path,
  };
}
