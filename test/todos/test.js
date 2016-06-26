'use strict'

const fs = require('fs')
const path = require('path')

const raml2obj = require('../..')

const ramlPath = path.resolve(__dirname, "todos.raml")

const api = raml2obj.parse(ramlPath, { logging: false })

console.log(JSON.stringify(api, null, 2))
