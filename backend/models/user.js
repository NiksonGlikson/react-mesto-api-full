const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const isEmail = require("validator/lib/isEmail");
const isURL = require("validator/lib/isURL");
const AuthorizationError = require("../errors/AutorizationError");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "Жак-Ив Кусто",
  },
  about: {
    type: String,
    default: "Исследователь",
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png",
    validate: {
      validator: (v) => isURL(v),
      message: "Некорректные данные поля avatar"
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: "Некорректные данные поля email"
    },
  },
  password: {
    type: String,
    required: true,
    select: false
  }
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }, { runValidators: true })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizationError("Неправильные почта или пароль"));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new AuthorizationError("Неправильные почта или пароль"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
