const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { insertUser } = require("../models/app.model");
const secretKey = process.env.JWT_SECRET;

const signup = async (req, res, next) => {
  const { username, name, avatar_url, password } = req.body;
  try {
    if (!username || !name || !password) {
      return res.status(400).send({ msg: "Missing required fields!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await insertUser({
      username,
      name,
      avatar_url,
      password: hashedPassword,
    });

    const token = jwt.sign({ username: newUser.username }, secretKey, {
      expiresIn: "2h",
    });
    res.status(201).send({
      token,
      user: {
        username: newUser.username,
        name: newUser.name,
        avatar_url: newUser.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup };
