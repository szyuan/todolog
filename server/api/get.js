'use strict';

var co = require('co');
var util = require('./util');
var getConn = util.getConn;
var sqlQuery = util.sqlQuery;

function todos(req, res) {
    var result = [];
    var userID = 1;
    var sql =   ' SELECT todos.id, title, tags.name as tagname, status, done, start_time, finish_time, elapsed_ms'+
                ' FROM `todos`, `tags`'+
                ' WHERE user_id = '+userID+
                ' AND todos.tag_id = tags.id'+
                ' ORDER BY todos.create_time DESC';
    // co流程控制
    co(function* () {
        var conn = yield getConn(req);
        var result = yield sqlQuery(conn,sql);

        res.json(result);
    }).catch((err) => {
        res.send(err.stack);
    });
}

function tags(req, res) {
    var result = [];
    var userID = 1;
    var sql =   ' SELECT id, name'+
                ' FROM `tags`'+
                ' WHERE create_user_id = '+userID+
                ' OR create_user_id is NULL';
    // co流程控制
    co(function* () {
        var conn = yield getConn(req);
        var result = yield sqlQuery(conn,sql);

        res.json(result);
    }).catch((err) => {
        res.json(err.stack);
    });
}



module.exports = {
    todos: todos,
    tags: tags
}