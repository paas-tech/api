import { PartialType } from '@nestjs/mapped-types';
import { CreateSshKeyDto } from './create-sshkey.dto';

export class SetSshKeyDto extends PartialType(CreateSshKeyDto) {}
