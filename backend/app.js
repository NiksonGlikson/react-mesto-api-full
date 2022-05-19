const express = require("express");

const { celebrate, Joi, errors } = require("celebrate");

const { PORT = 3000 } = process.env;

const app = express();

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");

const { requestLogger, errorLogger } = require("./middlewares/logger");

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

app.use(requestLogger);

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
