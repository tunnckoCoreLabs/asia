'use strict';

const path = require('path');
const proc = require('process');
const Emitter = require('events');

let id = 0;
const globalStats = [];

function createLines(meta, test) {
  const title = `${path.relative(proc.cwd(), meta.filename)} > ${test.title}`;
  const ok = test.isRejected ? 'not ok' : 'ok';
  const todo = test.todo ? '# TODO' : '';
  const type = test.skip ? '# SKIP' : todo;

  id += 1;

  console.log([`# ${title}`, [ok, id, '-', title, type].join(' ')].join('\n'));
}

module.exports = function tapReporter() {
  const reporter = new Emitter();
  reporter.name = 'tap';

  reporter.once('start', () => {
    console.log('TAP version 13');
  });

  reporter.on('afterEach', (meta, test) => {
    createLines(meta, test);
  });

  reporter.on('after', ({ stats }) => {
    globalStats.push(stats);
  });

  reporter.once('finish', () => {
    const stats = globalStats.reduce(
      (acc, stat) => {
        acc.count += stat.count;
        acc.pass += stat.pass;
        acc.fail += stat.fail;
        acc.todo += stat.todo;
        acc.skip += stat.skip;

        return acc;
      },
      { count: 0, pass: 0, fail: 0, todo: 0, skip: 0 },
    );

    console.log('');
    console.log(`1..${stats.count}`);
    console.log('# tests', stats.count);
    console.log('# pass', stats.pass);

    if (stats.skip) {
      console.log('# skip', stats.skip);
    }

    if (stats.todo) {
      console.log('# todo', stats.todo);
    }

    if (stats.fail) {
      console.log('# fail', stats.fail);
      console.log('');
    } else {
      console.log('');
      console.log('# ok');
    }
  });
  return reporter;
};
