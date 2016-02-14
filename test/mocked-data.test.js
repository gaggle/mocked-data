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
    expect(mockedData("./data")).to.be.an.object()
  })

  it("should read .json or .js files", function () {
    mockfs({
             "data/foo/bar.json": {},
             "data/foo/baz.js": "module.exports = function() {return 'wee'}"
           })
    var obj = mockedData("./data")
    expect(obj.foo.bar).to.be.a.function()
    expect(obj.foo.baz).to.be.a.function()
  })

  it("should read `_` as naked call", function () {
    mockfs({"data/foo/_.json": JSON.stringify({bar: false})})
    var value = mockedData("./data").foo()
    expect(value.bar).to.be.false()
  })

  it("should generate a naked call if none is provided", function () {
    mockfs({"data/foo/bar.json": ""})
    var obj = mockedData("./data")
    expect(obj.foo).to.throw(/Root access not implemented.*/)
  })

  it("should deep override .json", function () {
    mockfs({"data/foo/_.json": JSON.stringify({bar: false})})
    var value = mockedData("./data").foo({bar: true})
    expect(value.bar).to.be.true()
  })

  it("should pass overrides to .js function", function () {
    mockfs({"data/foo/_.js": "module.exports = function(o) {return o}"})
    var value = mockedData("./data").foo({bar: true})
    expect(value.bar).to.be.true()
  })

  it("should return subdata", function () {
    mockfs({"data/foo/subdata.json": JSON.stringify({})})
    expect(mockedData("./data").foo.subdata).to.be.a.function()
  })
})
