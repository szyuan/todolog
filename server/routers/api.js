var express = require('express');
var apiRouter = express.Router();

var mockData = require('../../mock-data.json');

apiRouter.get('/todos/',function(req,res,next){
  res.json(mockData.todos);
});
apiRouter.get('/tags/',function(req,res,next){
  res.json(mockData.tags);
});

module.exports = apiRouter;