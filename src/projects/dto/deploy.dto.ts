import { IsObject } from 'class-validator';

export class DeployDto {
  @IsObject()
  env_vars: Record<string, string>;
}
