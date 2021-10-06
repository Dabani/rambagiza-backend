import { deleteMany, insertMany } from '../models/post.js';
import { config } from 'dotenv';
import connectDatabase from '../config/database.js';

import posts from '../data/posts.json';
import { connect } from 'mongoose';

// Setting dotenv file
config({ path: 'src/config/config.env' });

connectDatabase();

const seedPosts = async () => {
  try {
    
    await deleteMany();
    console.log('Posts are deleted.');

    await insertMany(posts);
    console.log('All initial posts are added.');

    process.exit();

  } catch (error) {
    console.log(error.message);
    process.exit();
  }
}

seedPosts();
