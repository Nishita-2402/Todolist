// set up
const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app =express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

//init variables:
// let items=[];
// let workItems=[];


// using mongoose:
mongoose.connect("mongodb+srv://admin-nishita:BtcGtTYXAUXn.i4@atlascluster.0culu.mongodb.net/todolistDB");

//create mongoose schema
const itemsSchema = {
    name: String
};

//create model based on schema
const Item = mongoose.model("Item",itemsSchema);
//create default items
const item1 = new Item({
    name:"welcome to your todolist!"
});
const item2 = new Item({
    name:"Hit the + button to add a new item."
});
const item3 = new Item({
    name:"Hit the checkbox to delete an item."
});

const defaultItems = [item1,item2,item3];

// init a new list schema for each custom page
const listSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);


//get method:
app.get("/",function(req,res){
    // find item in our database
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            // insert many to the database
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully saved default items to DB.");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle:"Today",newListItem: foundItems});
        }        
    });
    
    // console.log(day);
    

});

// app.post("/",function(req,res){
//     // console.log(req.body);
//     let item=req.body.newItem;
//     if (req.body.list==="Work"){
//         workItems.push(item);
//         res.redirect("/work");
//     }else{
//         items.push(item);
//         res.redirect("/");
//     }
// });

// ignore work for now
app.post("/",function(req,res){
    console.log(req.body);
    const listName = req.body.list;
    const newItem = new Item({
        name:req.body.newItem
    });
    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});


app.post("/delete",function(req,res){
    // console.log(req.body);
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,err=>{
            if(!err){
                console.log("succefully deleted the item based on ID");
            }else{
                console.log(err);
            }
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err){
              res.redirect("/" + listName);
            }
          });
    }



    
    
});

app.get("/:newPageName",function(req,res){
    const newPageName = _.capitalize(req.params.newPageName);
    List.findOne({name: newPageName},function(err,foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: newPageName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+newPageName);
            }else{
                //show an existing list
                res.render("list",{listTitle:foundList.name,newListItem:foundList.items});
            }
        }
    });
    
});



// Below is the old work route:
// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"Work",newListItem: workItems});
// });

// app.post("/work",function(req,res){
//     res.redirect("/work");
// });

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);


app.listen(3000,function(){
    console.log("Server has Successfully");
});