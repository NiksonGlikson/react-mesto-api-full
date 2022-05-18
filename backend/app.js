const express = require("express");

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const { celebrate, Joi, errors } = require("celebrate");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
});

const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");
const CatcherError = require("./errors/CatcherError");
const NotFoundError = require("./errors/NotFoundError");

// Массив доменов, с которых разрешены кросс-доменные запросы
// const allowedCors = [
//   "https://praktikum.tk",
//   "http://praktikum.tk",
//   "localhost:3000",
//   "http://localhost:3000",
//   "https://localhost:3000",
//   "https://51.250.74.127:3000",
//   "https://51.250.74.127:3000",
//   "https://domainname.glinkin.nomoredomains.xyz",
//   "http://domainname.glinkin.nomoredomains.xyz",
// ];

// // eslint-disable-next-line prefer-arrow-callback
// app.use(function (req, res, next) {
//   const { origin } = req.headers;
//   if (allowedCors.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//     res.header("Access-Control-Allow-Credentials", true);
//   }

//   const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную
// eslint-disable-next-line max-len
//   const requestHeaders = req.headers["access-control-request-headers"]; // сохраняем список заголовков исходного запроса
// eslint-disable-next-line max-len
//   const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE"; // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)

//   // Если это предварительный запрос, добавляем нужные заголовки
//   if (method === "OPTIONS") {
//   // разрешаем кросс-доменные запросы любых типов (по умолчанию)
//     res.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
//     res.header("Access-Control-Allow-Headers", requestHeaders);
//     return res.end();
//   }
//   return (next);
// });

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});

app.post("/signin", celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post("/signup", celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/),
  }),
}), createUser);

app.use(auth);

app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

app.all("*", (req, res, next) => {
  next(new NotFoundError("По указанному пути ничего нет"));
});

app.use(errorLogger);

app.use(errors());
app.use(CatcherError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
