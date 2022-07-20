const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');
const Joi = require('joi');

const talkerJSONFile = './talker.json';

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().min(6),
    rate: Joi.number().integer().min(1).max(5), // https://www.tabnine.com/code/javascript/functions/joi/NumberSchema/integer
});

function validateUser(request, response, next) {
  const { email, password } = request.body;
  if (!email) return response.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!password) return response.status(400).json({ message: 'O campo "password" é obrigatório' });

  const emailError = schema.validate({ email }).error;
  const passwordError = schema.validate({ password }).error;
  
  if (emailError !== undefined) {
    return response.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (passwordError !== undefined) {
    return response.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
}

const validateToken = (request, response, next) => {
  const { authorization } = request.headers;

  if (!authorization) return response.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) {
    return response.status(401).json({ message: 'Token inválido' });
  }

  next();
};

const validateName = (request, response, next) => {
  const { name } = request.body;

  if (!name) return response.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return response.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const validateAge = (request, response, next) => {
  const { age } = request.body;

  if (!age) return response.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (age < 18) {
    return response.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const validateTalk = (request, response, next) => {
  const { talk } = request.body;

  if (!talk) return response.status(400).json({ message: 'O campo "talk" é obrigatório' });

  next();
};

const validateView = (request, response, next) => {
  const { talk: { watchedAt } } = request.body;
  const regexDateFormat = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
  // https://stackoverflow.com/questions/62960834/regex-date-dd-mm-yyyy

  if (!watchedAt) {
    return response.status(400).json({ message: 'O campo "watchedAt" é obrigatório' }); 
  }
  if (!regexDateFormat.test(watchedAt)) {
    return response.status(400)
    .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }

  next();
};

const validateRate = (request, response, next) => {
  const { talk: { rate } } = request.body;
  const rateError = schema.validate({ rate }).error;

  if (!rate && rate !== 0) {
    return response.status(400).json({ message: 'O campo "rate" é obrigatório' }); 
  }
  if (rateError !== undefined) {
    return response.status(400)
    .json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_request, response) => {
  const talkers = JSON.parse(await fs.readFile(talkerJSONFile));

  if (talkers.length === 0) {
    return response.status(200).json([]);
  }
  
  return response.status(200).json(talkers);
});

app.get('/talker/:id', async (request, response) => {
  const talkers = JSON.parse(await fs.readFile(talkerJSONFile));

  const query = talkers.find((talker) => talker.id === Number(request.params.id));

  if (query === undefined) {
    return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }

  return response.status(200).json(query);
});

app.post('/login', validateUser, async (request, response) => {
  const token = crypto.randomBytes(8).toString('hex');

  return response.status(200).json({ token });
});

app.post('/talker',
validateToken, validateName, validateAge, validateTalk, validateView, validateRate,
async (request, response) => {
  const talkers = JSON.parse(await fs.readFile(talkerJSONFile));
  
  const { name, age, talk } = request.body;
  const id = talkers.length + 1;
  const newTalker = { id, name, age, talk };

  talkers.push(newTalker);

  fs.writeFile(talkerJSONFile, JSON.stringify(talkers));
  return response.status(201).json(newTalker);
});

app.put('/talker/:id',
validateToken, validateName, validateAge, validateTalk, validateView, validateRate,
async (request, response) => {
  const talkers = JSON.parse(await fs.readFile(talkerJSONFile));

  const { id } = request.params;
  const { name, age, talk } = request.body;
  const newTalkerData = { name, age, talk };

  const editedTalker = { id: Number(id), ...newTalkerData };

  const newTalkers = talkers.map((talker) => (talker.id === Number(id) ? editedTalker : talker));

  fs.writeFile('./talker.json', JSON.stringify(newTalkers));
  return response.status(200).json(editedTalker);
});

app.listen(PORT, () => {
  console.log('Online', PORT);
});
