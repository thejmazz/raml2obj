'use strict'

const raml = require('raml-1-parser')

const tab = (num) => {
  let str = ''
  for(let i=0; i < num; i++) {
    str += '  '
  }
  return str
}

const addKey = (obj, key, value) => {
  obj[key] = value
  return obj
}

const parse = (source, opts) => {
  const path = source.split('/').slice(0, source.split('/').length-1).join('/') + '/'
  const api = raml.loadApiSync(source)

  let uses = api.uses()
  let usered = {}
  let seen = []

  const addUses = (use, obj) => {
    const { key, value } = use.toJSON()

    // keep track of RAML files visited
    if (seen.indexOf(value) >= 0) {
      obj.SEEN = value
      return 
    }

    // new file, add it to seen list
    seen.push(value)
 
    const api = raml.loadApiSync(path + value)

    obj[key] = { 
      path: value,
      // api,
      uses: {}
    }

    // for (let use of obj[useJSON.key].api.uses()) {
    for (let use of api.uses()) {
      addUses(use, obj[key].uses)
    }       
  }

  for (let use of uses) {
    addUses(use, usered)
  }
  
  console.log(JSON.stringify(usered, null, 2))
  

  const apiResources = api.resources()
  let ramled = {}

  // [ ... ] --> { name: val, name: val }
  // types from this file
  const types = api.types().reduce((prev, curr) => addKey(prev, curr.name(), curr), {})

  

  const processResource = (res) => {
    const relativeUri = res.relativeUri().value()
    const completeRelativeUri = res.completeRelativeUri()

    if (opts.logging) console.log(completeRelativeUri, "(", relativeUri, ")")

    const path = completeRelativeUri.substring(1).split('/')

    ramled[completeRelativeUri] = {}
    let currentObj = ramled[completeRelativeUri]

    const uriParams = res.uriParameters()
    if (opts.logging) uriParams.forEach(param => console.log(tab(1)+`${param.name()}:${param.type()}`))
    currentObj.uriParams = {}
    uriParams.forEach(param => currentObj.uriParams[param.name()] = param.type()[0])

    const methods = res.methods()
    currentObj.methods = {}
    let meth
    methods.forEach((method) => {
      meth = method.method()
      if (opts.logging) console.log(tab(1) + method.method())
      currentObj.methods[method.method()] = {}

      const bodies = method.body()
      bodies.forEach((body) => {
        if (opts.logging) console.log(tab(2) + 'body')
        currentObj.methods[method.method()].body = {}
        currentObj.methods[method.method()].body[body.name()] = {}

        const curr = currentObj.methods[method.method()].body[body.name()]

        const props = body.properties()
        if (opts.logging) props.forEach(prop => console.log(tab(3) + prop.name() + ': ' + prop.type()))
        props.forEach(prop => curr[prop.name()] = prop.type()[0])
      })

      const responses = method.responses()
      currentObj.methods[meth].responses = {}

      responses.forEach((response) => {
        const body = response.body()[0]

        let code = response.code().value()
        if (opts.logging) console.log(tab(2) + response.code().value())
        currentObj.methods[meth].responses[code] = {}
        currentObj.methods[meth].responses[code].body = {}
        currentObj.methods[meth].responses[code].body[body.name()] = {}
        const curr = currentObj.methods[meth].responses[code].body[body.name()]



        // console.log(tab(3) + 'body: ' + body.name() )
        if (opts.logging) console.log(tab(3) + 'body')

        const type = body.type()[0]
        const typeName = type.replace(/\[\]$/, '')

        // TODO better type checking
        if (type === 'object') {
          const props = body.properties()
          if (opts.logging) props.forEach(prop => console.log(tab(4) + prop.name() + ': ' + prop.type()))
          props.forEach(prop => curr[prop.name()] = prop.type()[0])
        } else {
          // Got a custom type
          if (opts.logging) console.log(tab(4) + 'type: ' + type)

          if (types[typeName] !== undefined) {
            const props = types[typeName].properties()
            if (opts.logging) props.forEach(prop => console.log(tab(5) + prop.name() + ': ' + prop.type()))

            if (type.substring(type.length-2) === '[]') {
              let tempObj = {}
              props.forEach(prop => tempObj[prop.name()] = prop.type()[0])

              let otherTemp = {}
              otherTemp[body.name()] = [tempObj]
              currentObj.methods[meth].responses[code].body = otherTemp
            } else {
              props.forEach(prop => curr[prop.name()] = prop.type()[0])
            }
          }
        }
      })
    })

    // Recursively traverse
    res.resources().forEach(res => processResource(res))
  }

  apiResources.forEach((resource) => {
    processResource(resource)
  })

  return ramled
}

module.exports.parse = parse
