# mocked-data
[![Build Status](https://travis-ci.org/gaggle/mocked-data.svg?branch=master)](https://travis-ci.org/gaggle/mocked-data)
[![Coverage Status](https://coveralls.io/repos/github/gaggle/mocked-data/badge.svg?branch=master)](https://coveralls.io/github/gaggle/mocked-data?branch=master)

Small module for exposing static data.

Say you capture output from an API to use in tests,
how do you use that data?
WIth this module you just put the captured data in a folder structure
and access it via methods on an object.
Supports **.json** and **.js** files.

Install

    npm install gaggle/mocked-data

Usage

    > var mocked = require("mocked-data")
    > var m = mocked("./example")
    > m.foo()
    { foo: 'root' }
    > m.bar.baz()
    'baz'
