import { Test, TestingModule } from '@nestjs/testing';
import { SshKeysController } from './sshkeys.controller';

describe('SshKeysController', () => {
  let controller: SshKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SshKeysController],
    }).compile();

    controller = module.get<SshKeysController>(SshKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
