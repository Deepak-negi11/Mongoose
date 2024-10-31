const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Users = new Schema({
    name : String,
    email : {type : String , unique :true},
    password : String

});


const Todos = new Schema({
    userId : ObjectId,
    title : String,
    done : Boolean

});


const UsersModel = mongoose.model('users',Users);
const TodosModel = mongoose.model('todos',Todos);

module.exports={
    UsersModel,
    TodosModel
};