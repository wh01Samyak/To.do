
const express = require("express");
const mongoose=require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI);

const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var userSchema = new mongoose.Schema({
  name: {type:String, required:true},
  username: {type:String, required:true, index: { unique: true}},
  password: {type:String, required:true},  
  dateOfCreation: {type:Date, required:true}
});

var noteSchema = new mongoose.Schema({
  title: {type: String, required:true},
  userId: {type: String, required:true},
  dueDate: Date,
  label: String,
  status: String,
  priority: String,
  description: String,
  dateOfCreation: {type:Date, required:true}
});

var User = mongoose.model('User', userSchema);
var Note = mongoose.model('Note', noteSchema);

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

// routes
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/login", (request, response) => {
  response.sendFile(__dirname + "/views/login.html");
});

app.get("/signup", (request, response) => {
  response.sendFile(__dirname + "/views/signup.html");
});

app.get("/home", (request, response) => {
  console.log("redirected");
  var userId = request.query.userId;
  console.log(userId);
  response.render(__dirname + "/views/home.html", {userId: userId});
});

// api's for CRUD operations
app.post("/verify_user", function(req, res) {
  // Get a user from mongo based on the username and password in body and return it's properties as a json.
  console.log("Get request");
  console.log(req.body);
  User.findOne({username:req.body.username},function(err, user){
   if (err) return console.log(err);
   if(user.password==req.body.password)
     {
       res.redirect("/home?userId="+user._id);
     } else{
       res.json({error: 'Password incorrect!'});
     }
  }); 
});

app.put("/user", function(req, res) {
  // Get user details from the body and update them to in mongo.
  var updateJson={};
  if(req.body.name){
    updateJson.name=req.body.name;
  }
  if(req.body.password){
    updateJson.password=req.body.password;
  }
  User.findOneAndUpdate(
    {_id:req.body._id},
    {$set: updateJson}, 
    {new : true}, 
    (err, data) => {
      if(err) return console.log(err);
      else{
        console.log(data);
        res.json(data);
      }
  });
});

app.delete("/user", function(req, res) {
  // Get a userId from body and delete it from mongo
  User.findByIdAndRemove(
    {_id:req.query.userId},
    function(err, user) {
      if(err) return console.log(err);
      else{
        res.json({message:"Account deleted!"});
      }
  });
  
});

app.post("/user", function(req, res) {
  // Get user details from the body and add it to in mongo.
  var outputJson={};
  if(!req.body.name){
      res.json({error:"Missing name!"});
  } else {
      outputJson.name=req.body.name;
  }
  if(!req.body.username){
      res.json({error:"Missing username!"});
  } else {
      outputJson.username=req.body.username;
  }
  if(!req.body.password){
      res.json({error:"Missing password!"});
  } else {
      outputJson.password=req.body.password;
  }
  outputJson.dateOfCreation=new Date(); 
  var newUser=new User(outputJson);
  newUser.save(function(err,data){
    if(err) return console.log(err);
    else{
      res.redirect("/home?userId="+data._id);
      console.log("Account created!");
    }
  });
});

app.get("/note", function(req, res) {
  // Get a note from mongo based on the userId in body and return it's properties as a json.
  var userId = req.query.userId;
  var labels = [];
  if(req.query.label1) labels.push(req.query.label1);
  if(req.query.label2) labels.push(req.query.label2);
  if(req.query.label3) labels.push(req.query.label3);
  if(req.query.label4) labels.push(req.query.label4);
  var priorities = [];
  if(req.query.priority1) priorities.push(req.query.priority1);
  if(req.query.priority2) priorities.push(req.query.priority2);
  if(req.query.priority3) priorities.push(req.query.priority3);
  if(req.query.priority4) priorities.push(req.query.priority4);
  var statuses = [];
  if(req.query.status1) statuses.push(req.query.status1);
  if(req.query.status2) statuses.push(req.query.status2);
  if(req.query.status3) statuses.push(req.query.status3);
  console.log("Get notes req by userId - "+userId);
  var query = {userId: userId};
  if (labels.length > 0) {
    query.label = { $in: labels };
  }
  if (priorities.length > 0) {
    query.priority = { $in: priorities };
  }
  if (statuses.length > 0) {
    query.status = { $in: statuses };
  }
  if (req.query.startingDate || req.query.endingDate){
    if(req.query.startingDate && req.query.endingDate){
      query.dueDate = { $gte: req.query.startingDate , $lte: req.query.endingDate };
    } else if(req.query.startingDate) {
      query.dueDate = { $gte: req.query.startingDate};
    } else {
      query.dueDate = { $gte: req.query.startingDate , $lte: req.query.endingDate };
    }
  }
  console.log(query);
  Note.find(query, function(err, notes) {
    if (err) return console.log(err);
    res.json({notes: notes});
  });
});

app.post("/modify_note", function(req, res) {
  // Get user details from the body and update them to in mongo.
  console.log("Post modify_notes req by body - "+JSON.stringify(req.body));
  var updateJson={};
  if(req.body.title) {
    updateJson.title = req.body.title;
  }
  updateJson.dueDate = req.body.dueDate;
  updateJson.label = req.body.label;
  updateJson.status = req.body.status;
  updateJson.priority = req.body.priority;
  updateJson.description = req.body.description;
  
  Note.findOneAndUpdate(
    {_id:req.body._id},
    {$set: updateJson}, 
    {new : true}, 
    (err, data) => {
      if(err) console.log(err);
      console.log(data);
      res.redirect("/home?userId="+req.body.userId);
  });
});

app.post("/note", function(req, res) {
  // Get a note's details from the body and add it to in mongo.
  var outputJson = {};
  if(!req.body.title) {
    res.json({error: "Missing title!"});
  } else{
    outputJson.title = req.body.title;
  }
  outputJson.userId = req.body.userId;
  if(req.body.dueDate) {
    outputJson.dueDate = req.body.dueDate;
  }
  
  if(req.body.label) {
    outputJson.label = req.body.label;
  }
  outputJson.status = "New";
  if(req.body.priority) {
    outputJson.priority = req.body.priority;
  }
  if(req.body.description) {
    outputJson.description = req.body.description;
  }
  outputJson.dateOfCreation=new Date(); 
  var newNote=new Note(outputJson);
  newNote.save(function(err,data){
    if(err) console.log(err);
    else{
      console.log(data);
      res.redirect("/home?userId="+data.userId);
    }
  });
});

app.delete("/note", function(req, res) {
  // Get a noteId from body and delete it from mongo
  console.log("Delete note api called with query -"+JSON.stringify(req.query));
  Note.findByIdAndRemove(
    {_id:req.query.noteId},
    function(err, note)
    {
    if(err) return console.log(err);
      console.log("/home?userId="+req.query.userId);
    res.json({hi:"/home?userId="+req.query.userId});
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
