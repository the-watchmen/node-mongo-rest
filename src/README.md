# API Framework

This framework builds on the extremely popular [Express](http://expressjs.com/) framework.

Typically a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) Web-API exposes the following operations for each resource:

- `INDEX`
- `GET`
- `CREATE`
- `UPDATE`
- `DELETE`

> these operations are sometimes generally referred to as "CRUD operations"

This framework allows for:
- easy definition of CRUD operations
- bonus "count" operation that can optionally be initiated in parallel to a `LIMIT` operation to obtain total count
- flexible processing of input parameters
- consistent processing of other standard operators such as `SKIP` and `LIMIT`.

## Configurable Router

The primary component here is [a configurable router](./router.js) that can be used to define CRUD routes for a resource in a consistent and efficient manner.

### Parameters

- `collectionName`: name of Mongo collection to use for resource
- `name`: (optional) name to use if different from collection name (typically used for embedded resources)
- `router`: (optional) express router preconfigured with desired routes
- `blackList`: (optional) list of parameters to skip auto conversion from string to native types
- `omitKeys`: (optional) list of parameters to omit when passing to data operations
- `xforms`: (optional) map of parameters to transform with either a simple string or a complex functional
- `matchers`: (optional) array of complex "matcher" constructs to perform arbitrary processing of parameter map
