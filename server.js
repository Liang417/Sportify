import express from 'express';
import { errorHandler } from './utils/errorHandler';
import activityRouter from './routes/activity';

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', [activityRouter]);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${process.env.PORT}`);
});
