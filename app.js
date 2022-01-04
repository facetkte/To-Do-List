const express = require("express");
const bodyParser = require("body-parser");
const day = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
//console.log(day()); //測試day()

const app = express();

const list = ["Buy food", "Cook food"];
const workItems = [];
const date = day.getDate(); //讓下方語法一致

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:2RRiidai@cluster0.hn3sz.mongodb.net/todolistDB");

const itemSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the ＋ button to add a new item."
});

const item3 = new Item({
  name: "<= Hit this to delete an item"
});

const deafaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({}, function(err, fondItems) {

    if (fondItems.length === 0) {
      Item.insertMany(deafaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Success save three deafaultItems");
      });
      res.redirect("/");
    }

    // fondItems.forEach(function(item){
    //    console.log(item.name);
    //  });
    else{
    res.render("list", {
      listTitle: date,
      newList: fondItems
      });
    }

  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (err)
      console.log(err);
    else {

      if(!foundList){ //創建空list
        console.log("Not exists");
        const list = new List({
        name: customListName,
        items: deafaultItems
      });
        list.save();
        res.redirect("/"+customListName);
      }

      else{
          console.log("exists");

          res.render("list", {
            listTitle: foundList.name,
            newList: foundList.items
          });
      }

    }

  });
});

app.post("/", function(req, res) {

  const text = req.body.textval;
  const list = req.body.list;
  const listName = req.body.listName;
  const addItems = new Item({
    name: text
  });

  if(listName === date){

    addItems.save();
    res.redirect("/");

  }

  else{
    List.findOne({name: list}, function(err, foundList){
    foundList.items.push(addItems);
    foundList.save();
    res.redirect("/"+list);
    });
  }

});

app.post("/delete", function(req, res) {
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date){

    Item.findByIdAndRemove(id, function(err) { //刪除checkbox
      if (!err)
        console.log("success delete one item");
    });

    res.redirect("/");
  }

  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, function(err, fondList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/Work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newList: workItems
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started success");
});
