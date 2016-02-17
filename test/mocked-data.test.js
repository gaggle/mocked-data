"use strict";
var glob = require("glob")
var mockfs = require("mock-fs")
var expect = require("must")
var rewire = require("rewire")

describe("mocked-data", function () {
  var mockedData
  beforeEach(function () {
    mockedData = rewire("../")
  })

  afterEach(function () {
    mockfs.restore()
  })

  it("should throw if location doesn't exist", function () {
    expect(mockedData.bind(this, "./doesntexist")).to.throw()
  })

  it("should initialize", function () {
    mockfs({"data": {}})
    var obj = mockedData("./data")
    expect(obj).to.be.an.object()
  })

  it("should read all formats", function () {
    mockfs({
             "data/foo/json.json": {},
             "data/foo/js.js": "module.exports = function() {return 'wee'}",
             "data/foo/txt.txt": "hello"
           })
    var obj = mockedData("./data")
    expect(obj.foo.json).to.be.a.function()
    expect(obj.foo.js).to.be.a.function()
    expect(obj.foo.txt()).to.eql("hello")
  })

  it("should read `_` as naked call", function () {
    mockfs({"data/foo/_.txt": "foo"})
    var obj = mockedData("./data")
    expect(obj.foo()).to.eql("foo")
  })

  it("should add naked call and also expose subdata", function () {
    mockfs({"data/foo/_.txt": "foo", "data/foo/bar/_.txt": "bar"})
    var obj = mockedData("./data")
    expect(obj.foo()).to.eql("foo")
    expect(obj.foo.bar()).to.eql("bar")
  })

  it("should generate throwy calls where none are provided", function () {
    mockfs({"data/foo/bar.txt": ""})
    var obj = mockedData("./data")
    expect(obj.foo).to.throw(/No root data.*/)
  })

  it("should deep override .json", function () {
    mockfs({"data/foo/_.json": JSON.stringify({bar: false})})
    var obj = mockedData("./data")
    expect(obj.foo({bar: true}).bar).to.be.true()
  })

  it("should pass overrides to .js function", function () {
    mockfs({"data/foo/_.js": "module.exports = function(o) {return o}"})
    var obj = mockedData("./data")
    expect(obj.foo({bar: true}).bar).to.be.true()
  })

  it("should return subdata", function () {
    mockfs({"data/foo/subdata.txt": "foo"})
    var obj = mockedData("./data")
    expect(obj.foo.subdata()).to.eql("foo")
  })

  it("should support nested subfolders", function () {
    mockfs({"data/foo/bar/baz/_.txt": "foo"})
    var obj = mockedData("./data")
    expect(obj.foo.bar.baz()).to.eql("foo")
  })

  it("should support nested subdata", function () {
    mockfs({"data/foo/bar/baz/data.txt": "foo"})
    var obj = mockedData("./data")
    expect(obj.foo.bar.baz.data()).to.eql("foo")
  })

  it("should support mixed subfolder depths", function () {
    mockfs({
             "data/foo/bar/baz/data.txt": "foo",
             "data/foo/data.txt": "bar"
           })
    var obj = mockedData("./data")
    expect(obj.foo.bar.baz.data()).to.eql("foo")
    expect(obj.foo.data()).to.eql("bar")
  })
})
