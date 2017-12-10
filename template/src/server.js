import http from 'http';
import express from 'express';
import meddleware from 'meddleware';
import shush from 'shush';

const config = shush('./config/middleware');

const app = express();
app.use(meddleware(config));
http.createServer(app).listen(8080);