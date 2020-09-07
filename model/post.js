const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  postTitle: String,
  postCategory: String,
  postAuthor: String,
  postText: String,
  postUrl: String,
});

module.exports = mongoose.model('Post', PostSchema);
