const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const jwtSecret = "shhhhh";

var jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const Todo = require("./models/todo");
const User = require("./models/user");

app.use(express.json());

app.get("/todos", authMiddleware, async function (req, res) {
  const todos = await Todo.find({});
  res.json(todos);
});

app.post("/register", async function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  const user = await User.create({ name, email, password });

  const token = generateToken(user);

  res.json({ user, token });
});

app.post("/login", async function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  const user = await User.findOne({ email });
  if (!user) return res.sendStatus(404);

  let authResult = await user.validatePassword(password);
  if (!authResult) return res.sendStatus(404);

  const token = generateToken(user);

  res.json({ user, token });
});

app.post("/todos", authMiddleware, async function (req, res) {
  var text = req.body.text;
  var description = req.body.description;
  const todo = await Todo.create({ text, description });
  res.json(todo);
});

app.delete("/todos/:id", authMiddleware, async function (req, res) {
  var id = req.params.id;
  await Todo.findByIdAndDelete(id);
  res.json({ success: true });
});

async function run() {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(
      "mongodb+srv://monymohhig:pgQ7comXw9SUGkfv@cluster0.dks0g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("Connected to online MongoDB");

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  } catch (error) {
    console.log("err", error);
  }
}
run();

function generateToken(user) {
  return jwt.sign({ foo: "bar" }, jwtSecret);
}

function verifyToken(token) {
  try {
    const obj = jwt.verify(token, jwtSecret);
    console.log("verified token: ", obj);
    return obj;
  } catch (err) {
    // err
    console.log("error verifying token: ", err);
    return null;
  }
}

function authMiddleware(req, res, next) {
  console.log("req.headers.token: ", req.headers.token);
  if (!req.headers.token) return res.sendStatus(403);
  let token = req.headers.token;

  const isVerified = verifyToken(token);

  console.log("isVerified: ", isVerified);

  if (!isVerified) return res.sendStatus(403);

  next();
}
