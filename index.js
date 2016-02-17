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
    var basename = Path.basename(path, Path.extname(path))
    var leafdirs = Path.dirname(path).split(Path.sep)
    leafdirs.reduce(function (previous, leaf) {
      var p = previous ? previous + "." + leaf : leaf
      if (_.get(obj, p) === undefined) {
        var func
        if (p === leafdirs.join(".")) {
          if (basename == "_") {
            var fullpath = Path.resolve(Path.join(rootpath, path))
            func = readfileFunc(fullpath)
          } else {
            func = function () {
              throw new Error("No root data, add a '_' file")
            }
          }
        } else {
          func = function () {
            throw new Error("No root data, add a '_' file")
          }
        }
        _.set(obj, p, func)
      }
      return p
    }, undefined)
  })

  sorted.forEach(function (path) {
    var basename = Path.basename(path, Path.extname(path))
    if (basename === "_") return
    var leafpath = Path.dirname(path).replace(new RegExp(Path.sep, "g"), ".") +
                   "." + basename
    var fullpath = Path.resolve(Path.join(rootpath, path))
    _.set(obj, leafpath, readfileFunc(fullpath))
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
  var readJS = function (p) {
    return eval(fs.readFileSync(p, "utf8"))
  }
  var readJSON = function (p) {
    return function (overrides, value) {
      var data = JSON.parse(fs.readFileSync(p, "utf8"))
      if (value === undefined)
        return _.merge(data, overrides || {})
      _.set(data, overrides, value)
      return data
    }
  }
  var readTxt = function (p) {
    return function () {
      return fs.readFileSync(p, "utf8")
    }
  }

  var loader = {
    ".js": readJS.bind(this, path),
    ".json": readJSON.bind(this, path),
    ".txt": readTxt.bind(this, path)
  }
  return loader[Path.extname(path)]()
}

module.exports = function (path) {
  if (!fs.existsSync(path)) throw new Error(path + " not found")
  return generateObject(path)
}
