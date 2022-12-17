require('dotenv').config();
const express = require('express');
const cors = require('cors');

const axios = require('axios');
const bodyParser = require("body-parser");
const server = require('./server');

const app = express();
const port = process.env.PORT || 3003;
const URL = process.env.URL;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.use(cors());

app.get('/', (req, res)=>res.render('index.html'));

app.get('/pending-message/:id', async (req, res)=>{
    try {
        var last_msg = await server.getLastMsg(req.params.id, 'messages');
        res.json({status: true, message: last_msg});
    } catch (error) {
        res.json({status: false, message: error});
    }
})

app.post('/update-message/:id', async (req, res)=>{
    try {
        await server.updateSheet(req.params.id, req.body.msg, req.body.st);
        res.json({status: true});
    } catch (error) {
        res.json({status: false, message: error});
    }
})



app.get('/session/:id', (req, res)=>res.render('single.html', {id: req.params.id}));

app.get('/get-status/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${URL}/sessions/status/${id}`);
        res.json(response.data);
    } catch (error) {
       res.json({status: false, message: error});
    }
});

app.get('/get-qr/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${URL}/sessions/add`, { 'id': id, 'isLegacy': false });
        res.json(response.data);
    } catch (error) {
       res.json({status: false, message: error});
    }
});

app.get('/disconnect/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.delete(`${URL}/sessions/delete/${id}`);
        res.json(response.data);
    } catch (error) {
       res.json({status: false, message: error});
    }
});

app.post('/send-message/:id', async (req, res)=>{
    try {
        const id = req.params.id;
        const msg = req.body.msg;
        var result = await axios.post(`${URL}/chats/send?id=${id}`, msg); 
        return res.json(result.data);
    } catch (error) {
       return res.json({success: false, message: error});
    }
});

app.get('/test-message/:id', async (req, res)=>{
    try {
        const id = req.params.id;
        const msg = {
            receiver: '919023736282',
            message: {
                text: 'hi test message'
            }
        };
        var result = await axios.post(`${URL}/chats/send?id=${id}`, msg); 
        return res.json(result.data);
    } catch (error) {
       return res.json({success: false, message: error});
    }
});



app.listen(port, () =>console.log('App running on *: ' + port));
