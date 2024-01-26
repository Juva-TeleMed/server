import express from 'express';
import DBConfig from './DBConfig/DBConfig.js';

const app = express();

const port = process.env.PORT || 4002;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
