import http from 'http';
import express from 'express';
import meddleware from 'meddleware';
import shush from 'shush';
import { isProduction } from './lib/util';

const config = shush('../config/middleware');

const app = express();
app.use(meddleware(config));

if (!isProduction()) {
  app.on('middleware:before', (event) => {
    const { name, ...spareConfig } = event.config;
    console.log('Using middleware', name, 'with configuration', spareConfig); // eslint-disable-line
  });
}


http.createServer(app).listen(process.env.APP_PORT || 8080);