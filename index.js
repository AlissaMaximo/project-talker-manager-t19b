const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

/* const validUser = {
  email: 'email@email.com',
  password: '123456',
  token: '7mqaVRXJSp886CGr',
}; */

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_request, response) => {
  const talkers = JSON.parse(await fs.readFile('./talker.json'));

  if (talkers.length === 0) {
    return response.status(200).json([]);
  }
  
  return response.status(200).json(talkers);
});

app.get('/talker/:id', async (request, response) => {
  const talkers = JSON.parse(await fs.readFile('./talker.json'));

  const query = talkers.find((talker) => talker.id === Number(request.params.id));

  if (query === undefined) {
    return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }

  return response.status(200).json(query);
});

app.post('/login', async (request, response) => {
  // const { email, password } = request.body;

  const token = crypto.randomBytes(8).toString('hex');

  return response.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online', PORT);
});

/* if (!email) {
    return response.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!password) {
    return response.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  
  if (email !== validUser.email) {
    return response.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (password < 6) {
    return response.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  } */