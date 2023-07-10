import { ClientOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';

const protoDir = 'paastech-proto/proto';

const gitHost = process.env.GIT_HOST;
const gitPort = process.env.GIT_PORT;

const pomegranateHost = process.env.POMEGRANATE_HOST;
const pomegranatePort = process.env.POMEGRANATE_PORT;

export const grpcClientOptions: { [key: string]: ClientOptions } = {
  git: {
    transport: Transport.GRPC,
    options: {
      url: `${gitHost}:${gitPort}`,
      package: ['gitrepomanager'],
      protoPath: [path.join(__dirname, '../../', protoDir, 'git-repo-manager.proto')],
      loader: {
        keepCase: true,
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
        includeDirs: [path.join(__dirname, '../../', protoDir)],
      },
    },
  },
  pomegranate: {
    transport: Transport.GRPC,
    options: {
      url: `${pomegranateHost}:${pomegranatePort}`,
      package: ['pomegranate'],
      protoPath: [path.join(__dirname, '../../', protoDir, 'pomegranate.proto')],
      loader: {
        keepCase: true,
        longs: Number,
        enums: String,
        defaults: false,
        arrays: true,
        objects: true,
        includeDirs: [path.join(__dirname, '../../', protoDir)],
      },
    },
  },
};
