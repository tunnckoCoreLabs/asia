'use strict';

const proc = require('process');
const ansi = require('ansi-colors');
const utils = require('./utils');
const api = require('./api');

if (!proc.env.ASIA_CLI) {
  const err = new Error('run your tests through the asia cli');
  console.error('AsiaError:', `${err.name}:`, err.message);
  proc.exit(1);
}

const parsedArgv = JSON.parse(proc.env.ASIA_ARGV);
ansi.enabled = parsedArgv.color;

const filename = proc.env.ASIA_TEST_FILE || __filename;
const reporter = utils.createReporter({ parsedArgv, utils, ansi, filename });

proc.on('uncaughtException', (err) => {
  reporter.emit('error', err);
  proc.exit(1);
});

const asia = api(reporter, parsedArgv);

proc.nextTick(() => {
  asia.run();
});

module.exports = asia;
