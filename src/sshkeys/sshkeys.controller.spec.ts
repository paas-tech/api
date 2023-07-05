import { Test, TestingModule } from '@nestjs/testing';
import { SshKeyController } from './sshkeys.controller';

describe('SshController', () => {
  let controller: SshKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SshKeyController],
    }).compile();

    controller = module.get<SshKeyController>(SshKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
