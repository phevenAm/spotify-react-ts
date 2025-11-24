import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('pong!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});