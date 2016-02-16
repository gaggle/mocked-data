"use strict"
var fs = require("fs")
var glob = require("glob")
var _ = require("lodash")
var Path = require("path")

var generateObject = function (rootpath) {
  var fixtures = getFiles(rootpath, "**/*.json", "**/*.js", "**/*.txt")
  var sorted = _.sortBy(fixtures, function (val) {
    return Path.dirname(val)
  })
  var obj = {}
  sorted.forEach(function (path) {
    var leafdirs = Path.dirname(path).split(Path.sep)
    var fullpath = Path.resolve(Path.join(rootpath, path))
    leafdirs.reduce(function (previous, leaf) {
      var p = previous ? previous + "." + leaf : leaf
      _.set(obj, p, getRootFunc(fullpath))
      return p
    }, "")
  })

  sorted.forEach(function (path) {
    var leafdirs = Path.dirname(path).replace(RegExp(Path.sep, "g"), ".")
    var basename = Path.basename(path, Path.extname(path))
    var fullpath = Path.resolve(Path.join(rootpath, path))
    _.set(obj, leafdirs + "." + basename, readfileFunc(fullpath))
  })
  return obj
}

var getRootFunc = function (path) {
  var basename = Path.basename(path, Path.extname(path))
  if (basename == "_") return readfileFunc(path)
  return function () {
    throw new Error("No root data, add a `_` file")
  }
}
var getFiles = function (cwd /*, patterns... */) {
  var patterns = Array.prototype.slice.call(arguments).slice(1)
  return patterns.reduce(function (previous, val) {
    return previous.concat(glob.sync(val, {cwd: cwd}))
  }, [])
}

var readfileFunc = function (path) {
  var readJSON = function () {
    return function (overrides) {
      var data = JSON.parse(fs.readFileSync(path, "utf8"))
      return _.merge(data, overrides || {})
    }
  }
  var readTxt = function () {
    return function () {
      return fs.readFileSync(path, "utf8")
    }
  }

  var loader = {
    ".json": readJSON,
    ".js": function () { return eval(fs.readFileSync(path, "utf8")) },
    ".txt": readTxt
  }
  return loader[Path.extname(path)]()
}

module.exports = function (path) {
  if (!fs.existsSync(path)) throw new Error(path + " not found")
  return generateObject(path)
}
