/* global chmod */
'use strict';

require('shelljs/global');
var fs = require('vinyl-fs');
var nodeFs = require('fs');
var map = require('map-stream');
var async = require('async');
var path = require('path');

var hooks = [
  'applypatch-msg',
  'commit-msg',
  'post-applypatch',
  'post-checkout',
  'post-commit',
  'post-merge',
  'post-receive',
  'post-rewrite',
  'post-update',
  'pre-applypatch',
  'pre-auto-gc',
  'pre-commit',
  'pre-push',
  'pre-rebase',
  'pre-receive',
  'prepare-commit-msg',
  'update'
];

function install(hook, destDir, cb) {
  cb = cb || destDir;

  if (!cb) cb(new Error('Callback must be supplied.'));
  if (typeof cb !== 'function') cb(new Error('Callback must be a function.'));
  if (hooks.indexOf(hook) === -1) cb(new Error('Invalid hook name.'));

  destDir = ((typeof destDir === 'function' ? null : destDir) ||
    exec('git rev-parse --show-toplevel')
      .output.slice(0, -1) + (path.sep + path.join('.git', 'hooks') + path.sep));

  var guppyHookFilename = `${hook}.guppy`;
  var hookFilename = hook;

  var destGuppyHook = path.join(destDir, guppyHookFilename);
  var destHook = path.join(destDir, hookFilename);

  return fs.src(path.join(__dirname, 'scripts/hookfile.guppy'))
    .pipe(map(function(file, next) {
      file.path = file.path.replace('hookfile.guppy', guppyHookFilename);
      next(null, file);
    }))
    .pipe(fs.dest(destDir))
    .on('finish', function () {
      chmod('u+x', destGuppyHook);

      var execGuppy = path.join('.git', 'hooks', guppyHookFilename);

      if (nodeFs.existsSync(destHook)) {
        var shebang = '#/usr/bin/env bash';

        if (!grep(shebang, destHook).trim()) {
          if (grep('#/usr/bin/env ', destHook).trim()) {
              cb(null, destGuppyHook);
              return;
          }
          echo(shebang + '\n').to(destHook);
        }

        if (!grep(execGuppy, destHook).trim()) {
          echo(execGuppy).toEnd(destHook);
        }

        cb(null, destGuppyHook);
      } else {
        echo('#/usr/bin/env bash \n' +
            execGuppy).to(destHook);
        chmod('u+x', destHook);

        cb(null, destGuppyHook);
      }
    })
    .on('error', function (err) {
      cb(err);
    });
}

function installAll(dest, cb) {
  async.parallel(
    hooks.map(function (hook) {
      return function (next) {
        return install(hook, dest, next);
      };
    }),
    cb
  );
}

module.exports.install = install;
module.exports.installAll = installAll;
