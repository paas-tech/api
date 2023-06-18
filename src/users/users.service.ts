import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';
import { User } from './interfaces/user';

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(user: CreateUserDto): User {
    const newUser: User = {
        username: user.username,
        email: user.email,
        projectCount: 0
    }
    this.users.push(newUser);
    return newUser;
  }

  findOne(uuid: string): User {
    return this.users[uuid];
  }

  delete(uuid: string) {
    this.users.splice(Number(uuid), 1);
  }

  setSshKey(sshKey: SetSshDto): string {
    return sshKey.publicKey;
  }
}