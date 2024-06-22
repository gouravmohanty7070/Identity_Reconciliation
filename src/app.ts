import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import sequelize from './utils/db';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/', router);

sequelize.sync().then(() => {
    console.log('Database synced');
}).catch(error => {
    console.error('Error syncing database:', error);
});

export default app;
