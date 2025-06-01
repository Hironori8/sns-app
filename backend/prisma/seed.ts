import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// PrismaClient をインスタンス化する前に環境変数を確認
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL が設定されていません。');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log('🌱 Seeding database...');

  // パスワードハッシュ化
  const passwordHash = await bcrypt.hash('password123', 10);

  // ダミーユーザー作成
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'alice',
        displayName: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        username: 'bob',
        displayName: 'Bob Smith',
        email: 'bob@example.com',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        username: 'charlie',
        displayName: 'Charlie Brown',
        email: 'charlie@example.com',
        passwordHash,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ダミー投稿作成
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Hello, world! This is my first post on this SNS app! 🎉',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Just had an amazing coffee ☕ at the local cafe. Perfect way to start the day!',
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Working on some exciting new features. Can\'t wait to share them with everyone! 🚀',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Beautiful sunset today 🌅 Nature never fails to amaze me.',
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content: 'Learning TypeScript and Prisma - such powerful tools for modern development! 💻',
        authorId: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // ダミーいいね作成
  const likes = await Promise.all([
    // Alice の投稿に Bob と Charlie がいいね
    prisma.like.create({
      data: {
        userId: users[1].id, // Bob
        postId: posts[0].id, // Alice's first post
      },
    }),
    prisma.like.create({
      data: {
        userId: users[2].id, // Charlie
        postId: posts[0].id, // Alice's first post
      },
    }),
    // Bob の投稿に Alice がいいね
    prisma.like.create({
      data: {
        userId: users[0].id, // Alice
        postId: posts[1].id, // Bob's coffee post
      },
    }),
    // Charlie の投稿に Alice と Bob がいいね
    prisma.like.create({
      data: {
        userId: users[0].id, // Alice
        postId: posts[3].id, // Charlie's sunset post
      },
    }),
    prisma.like.create({
      data: {
        userId: users[1].id, // Bob
        postId: posts[3].id, // Charlie's sunset post
      },
    }),
  ]);

  console.log(`✅ Created ${likes.length} likes`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect()
  });