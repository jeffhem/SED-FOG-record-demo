/* eslint no-console: 0 */
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const fs = require('fs');
const formidable = require('formidable');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 4000 : process.env.PORT;
const app = express();

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('/', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
  app.post('/savefile', (req, res) => {
    var form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (fields.audio_data) {
        fs.writeFileSync(`./outputs/${new Date(Date.now()).toISOString()}.ogg`, Buffer.from(fields.audio_data.replace('data:audio/ogg;base64,', ''), 'base64'));
        res.status(200).send('files saved!');
      } else {
        console.log('no audio found');
        res.status(204).send('no audio found');
      }
    })
  });
  // serving the output files
  app.use('/files', express.static('outputs'));
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
