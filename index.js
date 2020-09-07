const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

mongoose.connect(
  'mongodb+srv://dbUser:restfulapi@cluster0-lktkf.mongodb.net/test?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.Promise = global.Promise;

app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*
 *Handling CORS -  CROSS-ORIGIN RESOURCE SHARING
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-control-Allow-Headers',
    'Origin, X-Requested-With, Content_type, Accept, Authorizatoin'
  );

  //Method is a property which gives us access to the HTTP method used on the request
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

const port = process.env.PORT || 3001;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('DB connection alive');
});

const router = express.Router();
const Post = require('./model/post');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
// const upload = multer({ dest: 'uploads/' });

router.use(function (req, res, next) {
  console.log('Router is working..');
  next();
});

router.get('/', function (req, res) {
  res.json({ message: 'Welcome to my Api!' });
});

router
  .route('/posts')

  .post(upload.single('ImageUrl'), function (req, res) {
    const post = new Post({
      _id: new mongoose.Types.ObjectId(),
      postTitle: req.body.postTitle,
      postCategory: req.body.postCategory,
      postAuthor: req.body.postAuthor,
      postText: req.body.postText,
      ImageUrl: 'http://localhost:3001/' + req.file.path,
    });

    post
      .save()
      .then((result) => {
        console.log(result);
        res.status(201).json({
          message: 'Created post successfully',
          createdPost: {
            _id: result._id,
            postTitle: result.postTitle,
            postCategory: result.postCategory,
            postAuthor: result.postAuthor,
            postText: result.postText,
            request: {
              type: 'GET',
              url: 'http://localhost:3001/' + result._id,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  })
  .get(function (req, res) {
    Post.find(function (error, posts) {
      if (error) {
        res.send(error);
      }
      res.json(posts);
    });
  });

router
  .route('/posts/:post_id')

  .get(function (req, res) {
    Post.findById(req.params.post_id, function (error, post) {
      if (error) res.send(error);
      res.json(post);
    });
  })

  .put(function (req, res) {
    Post.findById(req.params.post_id, function (error, post) {
      if (error) res.send(error);
      post.postTitle = req.body.postTitle;
      post.postCategory = req.body.postCategory;
      post.postAuthor = req.body.postAuthor;
      post.postText = req.body.postText;
      post.postUrl = 'http://localhost:3001/' + req.file.path;

      post.save(function (error) {
        if (error) res.send(error);
        res.json({ message: 'updated!' });
      });
    });
  })

  .delete(function (req, res) {
    Post.remove(
      {
        _id: req.params.post_id,
      },
      function (error, post) {
        if (error) res.send(error);
        res.json({ message: 'Successfully deleted!' });
      }
    );
  });

app.use('/', router);
app.listen(port);
console.log('listening on port # ' + port);
