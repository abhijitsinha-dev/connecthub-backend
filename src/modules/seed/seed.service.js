import { faker } from '@faker-js/faker';
import User from '../user/user.model.js';
import Post from '../post/post.model.js';
import Otp from '../otp/otp.model.js';

const clearDemoData = async () => {
  await Post.deleteMany({ isDemo: true });
  await User.deleteMany({ isDemo: true });
  await Otp.deleteMany({ isDemo: true });
};

const seedDemoData = async (userCount = 10, postsPerUser = 3) => {
  await clearDemoData();

  const usersData = Array.from({ length: userCount }).map(() => {
    const fn = faker.person.firstName();
    const ln = faker.person.lastName();
    const usernameBase = `${fn}${ln}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username = `${usernameBase}_${faker.string.alphanumeric(4)}`.slice(0, 20);

    return {
      username,
      fullName: `${fn} ${ln}`.slice(0, 50),
      email: faker.internet.email({ firstName: fn, lastName: ln }),
      password: 'Password@123',
      emailVerified: true,
      status: 'active',
      isDemo: true,
      bio: faker.lorem.sentence().slice(0, 200),
      avatar: {
        url: faker.image.avatar(),
        publicId: 'demo_avatar'
      },
      coverImage: {
        url: faker.image.url(),
        publicId: 'demo_cover'
      }
    };
  });

  const users = await User.create(usersData);

  const postsData = [];
  for (const user of users) {
    for (let i = 0; i < postsPerUser; i++) {
        const hasImage = faker.datatype.boolean({ probability: 0.8 });
        
        const media = hasImage ? {
            url: faker.image.url({ width: 640, height: 480 }),
            publicId: 'demo_post_image',
            type: 'image'
        } : undefined;

      postsData.push({
        user: user._id,
        caption: faker.lorem.sentences(2).slice(0, 300),
        media,
        isDemo: true
      });
    }
  }

  await Post.create(postsData);

  return { usersCreated: users.length, postsCreated: postsData.length };
};

export { clearDemoData, seedDemoData };
