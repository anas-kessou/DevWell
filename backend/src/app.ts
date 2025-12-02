import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import fatigueRoutes from './routes/fatigue.routes';
import feedbackRoutes from './routes/feedback.routes';
import chatbotRoutes from './routes/chatbot.routes';


dotenv.config();

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({ message: '✅ Server is running successfully!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fatigue', fatigueRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chatbot', chatbotRoutes);
import libraryRoutes from './routes/library.routes';
app.use('/api/library', libraryRoutes);


export default app;