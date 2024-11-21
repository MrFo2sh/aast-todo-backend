const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  text: String,
  description: String,
});

module.exports = mongoose.model("todo", TodoSchema);
