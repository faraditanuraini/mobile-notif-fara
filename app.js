import express from 'express';
import cors from 'cors';
import authRoutes from './api-auth-notif/routes/auth.js';
import notificationRoutes from './api-auth-notif/routes/notifications.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ pesan: 'API Auth & Notification berjalan' });
});

app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);

export default app;