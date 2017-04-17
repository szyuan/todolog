var express = require('express');
var apiRouter = express.Router();

// @获取
apiRouter.get('/todos', require('../api/get').todos);
apiRouter.get('/tags', require('../api/get').tags);

// @新增
apiRouter.put('/todos', require('../api/put').todos);
// apiRouter.put('/tags', require('../api/put').tags);

// @修改
//      整体修改
apiRouter.post('/todos/', require('../api/post').todos);
//      修改单独属性
apiRouter.post('/todos/:attr', require('../api/post').todosAttr);

// @删除
apiRouter.delete('/todos/:todoID', require('../api/delete').todos);


// apiRouter.get('/todos', require('../api/post').todos);
// apiRouter.get('/tags', require('../api/post').tags);

module.exports = apiRouter;