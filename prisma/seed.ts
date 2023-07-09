import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * WARNING: This is purely for testing purposes.
 *
 * Seed the database with some sample data.
 *
 * Create two users with one project and one ssh key each.
 *
 * Note that if you are to use this to test git related features, you will need to
 * replace the ssh key values with your own public ssh keys.
 *
 * The function makes sure that the data is upserted, so you can run it multiple times
 *
 * Note that password for both users must be set in the .env file
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  // check if variables are set
  const vars = [
    process.env.DEV_USER_PASSWORD,
    process.env.DEV_USER_A_PUBLIC_KEY,
    process.env.DEV_USER_B_PUBLIC_KEY,
  ];

  if (vars.some((v) => v === undefined)) {
    throw new Error(
      'Please set all the required variables in the .env file, refer to the .env.example file',
    );
  }

  const hash = await bcrypt.hash(process.env.DEV_USER_PASSWORD, 10);

  const publicKeyUserA = process.env.DEV_USER_A_PUBLIC_KEY;
  const publicKeyUserB = process.env.DEV_USER_B_PUBLIC_KEY;

  await prisma.$transaction(async (tx) => {
    // add users
    await Promise.all([
      tx.user.upsert({
        where: {
          id: '83522487-e320-4e13-83b3-d1c0726942cc',
        },
        update: {},
        create: {
          id: '83522487-e320-4e13-83b3-d1c0726942cc',
          username: 'userA',
          email: 'userA@paastech.cloud',
          password: hash,
          isAdmin: false,
        },
      }),
      tx.user.upsert({
        where: {
          id: '1cc1f0e0-371d-4923-9ac1-1c176966c5a9',
        },
        update: {},
        create: {
          id: '1cc1f0e0-371d-4923-9ac1-1c176966c5a9',
          username: 'userB',
          email: 'userB@paastech.cloud',
          password: hash,
          isAdmin: false,
        },
      }),
    ]);

    // add their projects and their ssh keys
    await Promise.all([
      tx.project.upsert({
        where: {
          id: '6d309660-fd8d-45b1-95fb-c57790cb392a',
        },
        update: {},
        create: {
          id: '6d309660-fd8d-45b1-95fb-c57790cb392a',
          name: 'projectA',
          userId: '83522487-e320-4e13-83b3-d1c0726942cc',
        },
      }),
      tx.project.upsert({
        where: {
          id: 'ba0a2cd2-d33e-4d54-9e86-bd196966b35b',
        },
        update: {},
        create: {
          id: 'ba0a2cd2-d33e-4d54-9e86-bd196966b35b',
          name: 'projectB',
          userId: '1cc1f0e0-371d-4923-9ac1-1c176966c5a9',
        },
      }),
      tx.sshKey.upsert({
        where: {
          id: 1,
        },
        update: {},
        create: {
          id: 1,
          value: publicKeyUserA,
          userId: '83522487-e320-4e13-83b3-d1c0726942cc',
        },
      }),
      tx.sshKey.upsert({
        where: {
          id: 2,
        },
        update: {},
        create: {
          id: 2,
          value: publicKeyUserB,
          userId: '1cc1f0e0-371d-4923-9ac1-1c176966c5a9',
        },
      }),
    ]);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
