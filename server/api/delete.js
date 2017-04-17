'use strict';
/* 
* 删除记录操作
*/

var co = require('co');
var util = require('./util');
var getConn = util.getConn;
var sqlQuery = util.sqlQuery;
var v_ID = util.v_ID;

function todos(req, res) {
    var result = [];
    var userID = req.body.userID||1;
    var todoID = req.params.todoID;

    if(v_ID(userID)&&v_ID(todoID)){
        var sql =   ' DELETE FROM todos'+
                    ' WHERE user_id = ?'+
                    ' AND todos.id = ?';
        var args = [parseInt(userID), parseInt(todoID)];
        // co流程控制
        co(function* () {
            var conn = yield getConn(req);
            var result = yield sqlQuery(conn, sql, args);

            if(result.affectedRows<1) {
                throw {delete:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。'};
            }
            res.json({delete:"success", msg:'删除记录成功'});
        }).catch((err) => {
            res.send(err.stack);
        });
    }else {
        res.status(501).json({delete:"fail", msg:'参数格式不合法'})
    }
    
}


module.exports = {
    todos: todos
}