module.exports = {
    getConn,
    sqlQuery,
    v_ID,
    v_title
};




function getConn(req) {
    return new Promise(function(resolve, reject) {
        req.getConnection((err, conn) => {
            if(err) {
                reject(err);
            }else {
                resolve(conn);
            }
        });
    });
}
function sqlQuery(conn, sql, argArr) {
    return new Promise((resolve, reject) => {
        conn.query(sql, argArr, (err, rs) => {
            if(err) {
                reject(err);
            }else {
                resolve(rs);
            }
        });
    });
}


// ============= 格式验证 ============

function v_ID(id) {
    if(!isNaN(parseInt(id))) {
        return true;
    }
    return false;
}
// -title
function v_title(title) {
    if(title) {
        if(typeof title === 'string') {
            if(title.trim().length > 0) {
                return true;
            }
        }
    }
    return false;
}