const jwt = require("jsonwebtoken");
const { selectUserByUsername } = require("../models/app.model");
const bcrypt = require("bcrypt");

const secretKey = process.env.JWT_SECRET;

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await selectUserByUsername(username);
    if (!user) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign({ username: user.username }, secretKey, {
      expiresIn: "2h",
    });

    return res.status(200).send({
      token,
      user: {
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ msg: "No token provided" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send({ msg: "Invalid token!" });
    req.user = user;
    next();
  });
};

module.exports = { login, authenticate };
