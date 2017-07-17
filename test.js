/* exported mv */
'use strict';

var test = require('tape');
var sh = require('shelljs');
var proxy = require('proxyquire');
var gup = proxy('./index.js', {
  'child_process': {
    exec: function(_, cb) {
      cb(null, '/some/path\n');
    }
  },
  'shelljs/global': {}
});
var mv = function(){};

test('install clean', function (t) {
  t.plan(2);

  gup.install('pre-commit', './', function () {
    t.equal(sh.test('-f', './pre-commit.guppy'), true, 'should create pre-commit guppy hookfile');
    t.equal(sh.test('-f', './pre-commit'), true, 'should create pre-commit hookfile');

    sh.rm('./pre-commit.guppy');
    sh.rm('./pre-commit');
  });
});

test('installAll', function (t) {
  t.plan(17);

  gup.installAll('./', function (err, results) {
    if (err) t.fail('should not receive an error');
    t.ok(sh.test('-f', './applypatch-msg.guppy'), 'should create applypatch-msg guppy hookfile');
    t.ok(sh.test('-f', './commit-msg.guppy'), 'should create commit-msg guppy hookfile');
    t.ok(sh.test('-f', './post-applypatch.guppy'), 'should create post-applypatch guppy hookfile');
    t.ok(sh.test('-f', './post-checkout.guppy'), 'should create post-checkout guppy hookfile');
    t.ok(sh.test('-f', './post-commit.guppy'), 'should create post-commit guppy hookfile');
    t.ok(sh.test('-f', './post-merge.guppy'), 'should create post-merge guppy hookfile');
    t.ok(sh.test('-f', './post-receive.guppy'), 'should create post-receive guppy hookfile');
    t.ok(sh.test('-f', './post-rewrite.guppy'), 'should create post-rewrite guppy hookfile');
    t.ok(sh.test('-f', './post-update.guppy'), 'should create post-update guppy hookfile');
    t.ok(sh.test('-f', './pre-applypatch.guppy'), 'should create pre-applypatch guppy hookfile');
    t.ok(sh.test('-f', './pre-auto-gc.guppy'), 'should create pre-auto-gc guppy hookfile');
    t.ok(sh.test('-f', './pre-commit.guppy'), 'should create pre-commit guppy hookfile');
    t.ok(sh.test('-f', './pre-push.guppy'), 'should create pre-push guppy hookfile');
    t.ok(sh.test('-f', './pre-rebase.guppy'), 'should create pre-rebase guppy hookfile');
    t.ok(sh.test('-f', './pre-receive.guppy'), 'should create pre-receive guppy hookfile');
    t.ok(sh.test('-f', './prepare-commit-msg.guppy'), 'should create prepare-commit-msg guppy hookfile');
    t.ok(sh.test('-f', './update.guppy'), 'should create update guppy hookfile');

    results.forEach(function (file) {
      if (sh.test('-f', file)) sh.rm(file);
      if (sh.test('-f', file.split('.guppy')[0])) sh.rm(file.split('.guppy')[0]);
    });
  });
});
