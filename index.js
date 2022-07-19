const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

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

app.listen(PORT, () => {
  console.log('Online', PORT);
});
