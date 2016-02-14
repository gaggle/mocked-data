"use strict"
var fs = require("fs")
var glob = require("glob")
var _ = require("lodash")
var Path = require("path")

var generateObject = function (rootPath) {
  var obj = {}
  var fixtures = getFiles(rootPath, "**/*.json", "**/*.js")
  fixtures.forEach(function (path) {
    var leafdir = Path.basename(Path.dirname(path))
    var basename = Path.basename(path, Path.extname(path))
    var fullpath = Path.resolve(Path.join(rootPath, path))
    if (basename == "_") {
      obj[leafdir] = readfileFunc(fullpath)
    } else {
      if (!obj[leafdir]) obj[leafdir] = function () {
        throw new Error("Root access not implemented, add a `_` file")
      }
      obj[leafdir][basename] = readfileFunc(fullpath)
    }
  })
  return obj
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
  var loader = {
    ".json": readJSON,
    ".js": function () { return eval(fs.readFileSync(path, "utf8")) }
  }
  return loader[Path.extname(path)]()
}

module.exports = function (path) {
  if (!fs.existsSync(path)) throw new Error(path + " not found")
  return generateObject(path)
}
