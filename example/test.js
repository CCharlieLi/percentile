'use strict';

const fs = require('fs');
const readline = require('readline');
const { Percentile } = require('../');

const p = new Percentile();
const logFolder = './logs/';
let files = fs.readdirSync(logFolder);
let count = 0;

const initHandler = (rl) => {
  rl.on('line', (line) => {
    const delay = line.split(' ')[5];
    p.push(parseInt(delay));
    count++;
  });

  rl.on('close', () => {
    console.log('count', count);
    p.compress();
    files.shift();
    if (files.length === 0) {
      console.log(
        `90% of requests return a response within ${parseInt(
          p.percentile(0.9)
        )} ms`
      );
      console.log(
        `95% of requests return a response within ${parseInt(
          p.percentile(0.95)
        )} ms`
      );
      console.log(
        `99% of requests return a response within ${parseInt(
          p.percentile(0.99)
        )} ms`
      );
    } else {
      readlines(files);
    }
  });
};

const readlines = (fileNames) => {
  if (fileNames.length > 0) {
    console.log(`processing file ${fileNames[0]}`);
    rl = readline.createInterface({
      input: fs.createReadStream(`${logFolder}${fileNames[0]}`),
    });
    initHandler(rl);
  }
};

let rl = readline.createInterface({
  input: fs.createReadStream(`${logFolder}${files[0]}`),
});
initHandler(rl);
