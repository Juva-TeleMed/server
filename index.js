import express from 'express';
import DBConfig from './DBConfig/DBConfig.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import workersRoute from './routes/workersRoute.js';
import patientsRoute from './routes/patientsRoute.js';

const app = express();

// middlewares
app.use([
  cors('*'),
  cookieParser(),
  express.json(),
  express.urlencoded({ extended: true }),
]);

app.get('/', (req, res) => {
  res.send('Welcome to Juva-TeleMed');
});
app.use('/api/workers', workersRoute);
app.use('/api/patients', patientsRoute);

const port = process.env.PORT || 4002;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
