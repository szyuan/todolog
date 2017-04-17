'use strict';

var co = require('co');
var util = require('./util');
var getConn = util.getConn;
var sqlQuery = util.sqlQuery;

// 新增todo
function todos(req, res) {
    var result = {};
    var userID = 1;
    var sql =   ' INSERT INTO todos (user_id, title, tag_id)'+
                ' VALUES (?, ?, ?)';
    var args = [userID, req.body.newTodo.title, req.body.newTodo.tagID];
    var newTodo = req.body.newTodo;

    if(newTodoValidate(newTodo)){
        // co流程控制
        co(function* () {
            var conn = yield getConn(req);
            var insertRs = yield sqlQuery(conn,sql,args);
            res.json({success:true, title:newTodo.title, id:insertRs.insertId});
            console.log(insertRs);
        }).catch((err) => {
            res.send(err.stack);
        });
    }else {
        res.status(501).send('新增todo格式错误');
    }
}

// 新增tags
function tags(req, res) {
    
}




function newTodoValidate(todo) {
    var title = todo.title;
    if(title) {
        if(typeof title === 'string') {
            if(title.trim().length > 0) {
                return true;
            }
        }
    }
    return false;
}

module.exports = {
    todos: todos,
    tags: tags
}