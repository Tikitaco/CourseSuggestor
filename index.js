var express = require('express');
var router = express.Router();
var app = express();
var path = require("path");

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname+'/webpage/index.html'));
})

app.listen(1234, () => {
    console.log('http://localhost:1234')
})
