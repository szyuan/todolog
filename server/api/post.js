'use strict';

var co = require('co');
var moment = require('moment');
var util = require('./util');

var getConn = util.getConn;
var sqlQuery = util.sqlQuery;
var v_ID = util.v_ID;
var v_title = util.v_title;

// 修改todo
function todos(req, res) {
    res.json({todos:1});
}
function todosAttr(req, res) {
    var result = {};
    var userID = 1;
    // 修改类型
    var attr = req.params.attr;
    var id = req.body.id;
    var sql = '';

    switch(attr) {
        case 'title': {
            setTitle(req,res);
            break;
        };
        case 'start': {
            todoStart(req,res);
            break;
        };
        case 'pause': {
            todoPause(req,res);
            break;
        };
        case 'done': {
            todoDone(req,res);
            break;
        };
        default :{
            res.status(501).json({msg:"修改属性不合法"});
            break;
        }
    }
}



// 修改tags
function tags(req, res) {
    req.json({tags:0});
}

// ***************** 工具函数 ***********************

// @ 设置todo.title
function setTitle(req,res) {
    var todoID = req.body.todoID;
    var userID = req.body.userID;
    var destTitle = req.body.title;
    var sql = '';
    var args = [];
    if(v_ID(todoID)&&v_ID(todoID)&&v_title(destTitle)) {
        sql =   " UPDATE todos"+
                " SET title = ?"+
                " WHERE id = ?"+
                " AND user_id = ?";
        args = [destTitle, parseInt(todoID), parseInt(userID)];
        co(function* () {
            var conn = yield getConn(req);
            var result = yield sqlQuery(conn, sql, args);
            console.log(result);
            // 没有匹配的记录受到影响：userID与todoID不匹配
            if(result.affectedRows<1) {
                throw {update:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。'};
            }
            res.json({update:"success", updateID: todoID});
        }).catch((err) => {
            res.status(501).send(err.stack);
        });
    }else {
        res.status(501).json({update:"fail", msg:'title格式不合法'})
    }
}

// ### 改变状态 ###

// @ 开始
function todoStart(req, res) {
    /* 
    *  1.设置statu为1（表示正在计时）;
    *  2.设置start_time为当前时间.
    */
    var todoID = req.body.todoID;
    var userID = req.body.userID;
    var sql = '';
    var args = [];
    if(v_ID(todoID)&&v_ID(userID)) {
        sql =   " UPDATE todos SET"+
                " status = ?,"+
                " start_time = CURRENT_TIMESTAMP"+
                " WHERE id = ?"+
                " AND user_id = ?";
        args = [1, parseInt(todoID), parseInt(userID)];
        co(function* () {
            var conn = yield getConn(req);
            var result = yield sqlQuery(conn, sql, args);
            console.log(result);
            // 没有匹配的记录受到影响：userID与todoID不匹配
            if(result.affectedRows<1) {
                throw {update:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。'};
            }
            res.json({update:"success", updateID: todoID, msg:'todo开始成功'});
        }).catch((err) => {
            res.status(501).send(err.stack);
        });
    }else {
        res.status(501).json({update:"fail", msg:'参数格式不合法'})
    }
}

// @ 暂停
function todoPause(req, res, callback) {
    /* 
    *  1.设置statu为0（表示停止计时）;
    *  2.更新elapsed_ms（累加当前与start_time的时间差）。
    */
    var todoID = req.body.todoID;
    var userID = req.body.userID;
    var sql_elapsed = '';
    var args_elapsed = [];
    var sql = '';
    var args = [];
    var elapsedMS = 0;
    var elapsedAdd = 0;

    if(v_ID(todoID)&&v_ID(userID)) {
        // 先获取elapesd_time
        sql_elapsed = "SELECT status, start_time, elapsed_ms FROM todos WHERE id = ? AND user_id = ?";
        args_elapsed = [parseInt(todoID), parseInt(userID)];
        
        co(function* () {
            var conn = yield getConn(req);
            var result = yield sqlQuery(conn, sql_elapsed, args_elapsed);
            var status, startTime;
            if(result.length > 0) {
                
                status = result[0].status;
                startTime = result[0].start_time;
                elapsedMS = parseInt(result[0].elapsed_ms);
                
                if(status === 0) {
                    // 已经停止过，不再累加elapsed_time
                    elapsedAdd = 0;
                    res.json({update:"success", updateID: todoID, msg:'todo已经是暂停状态'});
                }else {
                    var startTimeMS = Date.parse(startTime);
                    
                    // 修改记录： 设置status为0，修改elapsed_time
                    sql =   " UPDATE todos SET"+
                            " status = ?,"+
                            " elapsed_ms = ?"+
                            " WHERE id = ?"+
                            " AND user_id = ?";
                    // 计算elapsed_time
                    var nowMS = Date.now();
                    elapsedAdd = nowMS - startTimeMS;
                    elapsedMS+=elapsedAdd;
                    // args
                    args = [0, elapsedMS, parseInt(todoID), parseInt(userID)];
                    // 执行update
                    var updateResult = yield sqlQuery(conn, sql, args);
                    
                    if(updateResult.affectedRows > 0) {
                        res.json({update:"success", updateID: todoID, msg:'todo暂停成功'});
                    }else {
                        throw {update:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。设置status，elapsed记录失败'}    
                    }
                }
            }else {
                throw {update:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。获取elapsed记录失败'}
            }
        }).catch((err) => {
            res.status(501).send(err.stack);
        });
    }else {
        res.status(501).json({update:"fail", msg:'参数格式不合法'})
    }
}

// @ 完成todo —— 
function todoDone(req,res) {
    /* 
    *   1.更新elapsed_ms（累加当前与start_time的时间差）若不为停止状态（status!=0）,；
    *   2.修改done字段为1； 
    *   3.设置finish_time字段为当前时间(done原本不为1的情况下)； 
    */
    var todoID = req.body.todoID;
    var userID = req.body.userID;
    
    if(v_ID(userID)&&v_ID(todoID)) {
        // 先获取原本的status,done,elapesd_ms
        var sql1 = "SELECT done, status, elapsed_ms, start_time FROM todos WHERE id = ? AND user_id = ?";
        var args1 = [parseInt(todoID), parseInt(userID)];

        co(function* () {
            var conn = yield getConn(req);
            var result = yield sqlQuery(conn, sql1, args1);
            // select 结果处理
            if(result.length<1) {
                throw {update:"fail", stack:'没有找到匹配的记录，或者你没有操作这条记录的权限。'};
            }
            var done = result[0].done;
            var status = result[0].status;
            var elapsedMS = result[0].elapsed_ms;
            var startTime = result[0].start_time;
            var elapsedAdd = 0;

            if(done === 1) {
                // 已经是完成状态，不做操作
                res.json({update:"success", updateID: todoID, msg: "todo已经是完成状态"})
            }else {
                // 更新操作
                // status改为停止(0)，finish_time改为当前，设置elapsed_ms
                var sql2 =  " UPDATE todos SET"+
                            " done = 1,"+
                            " status = 0,"+
                            " elapsed_ms = ?,"+
                            " finish_time = CURRENT_TIMESTAMP"+
                            " WHERE id = ?"+
                            " AND user_id = ?";
                var args2 = [elapsedMS,parseInt(todoID), parseInt(userID)]
                if(status === 1){
                    // 若status并未停止，则累加elapsed_ms
                    var nowMS = Date.now();
                    elapsedAdd = nowMS - Date.parse(startTime);
                    args2[0] = elapsedMS+elapsedAdd;
                }
                var updateResult = yield sqlQuery(conn, sql2, args2);
                res.json({update:"success", updateID: todoID, msg: "done成功"});
            }
        }).catch((err) => {
            res.status(501).send(err.stack);
        });
    }else {
        res.status(501).json({update:"fail", msg:'参数不合法'})
    }
}



module.exports = {
    todos: todos,
    todosAttr: todosAttr,
    tags: tags
}