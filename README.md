# RAML to object - UPDATED FOR RAML 1.0

This is my fork of [raml2html/raml2obj](https://github.com/raml2html/raml2obj). It is quite a divergence, as the original uses the `toJSON()` method on the object returned by [raml-js-parser-2](https://github.com/raml-org/raml-js-parser-2), whereas I use the AST methods to travel through the RAML and construt my own object representation. As per the [getting started guide](https://github.com/raml-org/raml-js-parser-2/blob/master/documentation/GettingStarted.md):

> `toJSON` method is a useful tool for debugging, but should not be relied upon by JS RAML Parser users to actually analyze and modify RAML AST

The end result is a leaner object (no `__METADATA__`, etc), as well as greater configuration (for example, nested object routes vs not-nested). Furthermore, it supports parsing custom JSON Schemas. Ideally, it produces an object similar to what [js-yaml](https://github.com/nodeca/js-yaml) would, except it also resolves Schema types. RAML goes in:

```yaml
#%RAML 1.0
title: todos

types:
  Todo:
    properties:
      content: string
      completed: boolean
      id: number
    example:
      content: "Make lunch"
      completed: true
      id: 2


/todos:
  post:
    body:
      application/json:
        properties:
          content: string
        example:
          content: "Buy eggs"
    responses:
      200:
        body:
          application/json:
            type: Todo

  /all:
    get:
      responses:
        200:
          body:
            application/json:
              type: Todo[]

  /{id}:
    get:
      responses:
        200:
          body:
            application/json:
              properties:
                content: string
                completed: boolean
    delete:
      responses:
        204:
          body:
            application/json:
              properties:
                success: boolean
                message: string

    put:
      body:
        application/json:
          properties:
            completed: boolean
      responses:
        200:
          body:
            application/json:
              properties:
                content: string
                completed: boolean
              example:
                content: "Buy eggs"
                completed: true
```

And JSON comes out:

```json
{
  "/todos": {
    "uriParams": {},
    "methods": {
      "post": {
        "body": {
          "application/json": {
            "content": "string"
          }
        },
        "responses": {
          "200": {
            "body": {
              "application/json": {
                "content": "string",
                "completed": "boolean",
                "id": "number"
              }
            }
          }
        }
      }
    }
  },
  "/todos/all": {
    "uriParams": {},
    "methods": {
      "get": {
        "responses": {
          "200": {
            "body": {
              "application/json": [
                {
                  "content": "string",
                  "completed": "boolean",
                  "id": "number"
                }
              ]
            }
          }
        }
      }
    }
  },
  "/todos/{id}": {
    "uriParams": {
      "id": "string"
    },
    "methods": {
      "get": {
        "responses": {
          "200": {
            "body": {
              "application/json": {
                "content": "string",
                "completed": "boolean"
              }
            }
          }
        }
      },
      "delete": {
        "responses": {
          "204": {
            "body": {
              "application/json": {
                "success": "boolean",
                "message": "string"
              }
            }
          }
        }
      },
      "put": {
        "body": {
          "application/json": {
            "completed": "boolean"
          }
        },
        "responses": {
          "200": {
            "body": {
              "application/json": {
                "content": "string",
                "completed": "boolean"
              }
            }
          }
        }
      }
    }
  }
}
```

**IMPORTANT: This is a development branch and should be considered experimental/ pre-alpha**  

[![NPM version](http://img.shields.io/npm/v/raml2obj.svg)](https://www.npmjs.org/package/raml2obj)
[![js-standard-style](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat)](https://github.com/airbnb/javascript)

A thin wrapper around [raml-parser](https://www.npmjs.org/package/raml-parser), adding extra properties to the resulting
object for use in [raml2html](https://www.npmjs.org/package/raml2html) and [raml2md](https://www.npmjs.org/package/raml2md).


## Install
```
npm i raml2obj --save
```


## Usage
```
var raml2obj = require('raml2obj');

// source can either be a filename, url, file contents (string) or parsed RAML object.
// Returns a promise.
raml2obj.parse(source).then(function(ramlObj) {
  // Do something with the resulting ramlObj :)
});
```


## Contribute
raml2obj is an open source project and your contribution is very much appreciated.

1. Check for open issues or open a fresh issue to start a discussion around a feature idea or a bug.
2. Fork the repository on Github and make your changes on the **develop** branch (or branch off of it).  
   Please retain the [code style](https://github.com/airbnb/javascript) that is used in the project and `npm run lint` before committing.
3. Add an example of the new feature to example.raml (if applicable)
4. Send a pull request (with the develop branch as the target).

A big thank you goes out to everyone who helped with the project, the [contributors](https://github.com/raml2html/raml2obj/graphs/contributors)
and everyone who took the time to report issues and give feedback.


## License
raml2obj is available under the MIT license. See the LICENSE file for more info.
