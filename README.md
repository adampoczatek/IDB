# IDB.js - indexedDB Wrapper

IDB.js is a simple wrapper for indexedDB API available in HTML5. The idea of this script is to help you organise your indexedDB connections and transactions, and to avoid code repetition.

## Example

IndexedDB is asynchronous so most of the methods provide callbacks. To create/open your Database you need to call `new IDB` and provide 3 arguments: `setup` object, `successHandler` and `errorHandler` (optional). Here's an example:

    var db;
    
    new window.IDB({
        db: "Todo",
        version: 1,
        stores: [
            {
                name: "tasks",
                keyPath: "postDate",
                schema: {
                    postDate: { unique: true },
                    title: { unique: false },
                    content: { unique: false },
                    tags: { unique: false },
                    due: { unique: false },
                    users: { unique: false }
                }
            },
            {
                name: "tags",
                keyPath: "id",
                schema: {
                    id: { unique: true },
                    text: { unique: true },
                    colour: { unique: false },
                    priority: { unique: false }
                }
            }
        ]
    }, function() {
        db = this;
        
        // Do more stuff...
    });

## API Reference

 - [.getStoreInfo()](#getstoreinfo)
 - [.insert()](#insert)
 - [.openStore()](#openstore)
 - [.query()](#query)
 - [.queryMultipleKeys()](#querymultiplekeys)
 - [.remove()](#remove)
 - [.update()](#update)

###.getStoreInfo()
[Back to top](#api-reference)

**Description:** Get information on a specific store.

    .getStoreInfo(storeName, successHandler, errorHandler)

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.

==

###.insert()

[Back to top](#api-reference)

**Description:** Insert data into a specific store.

    .insert(value, overwrite, storeName, successHandler, errorHandler)

**Parameter:** `value`

**Type:** `Object`

**Description:** A data object that will get inserted into the database.

==

**Parameter:** `overwrite`

**Type:** `Boolean`

**Description:** If true, `value` will overwrite existing entry if already exists (only if the Store keyPath is not set
to `autoIncrement` [read more](https://developer.mozilla.org/en/docs/IndexedDB/Using_IndexedDB#Structuring_the_database)).

==

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.

==

###.openStore()

[Back to top](#api-reference)

**Description:** Open store and return `IDBObjectStore`.

    .openStore(storeName, mode)

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `mode`

**Type:** `String`

**Description:** Transaction mode: `readwrite` (default) and `readonly` [read more](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase.transaction#Parameters).

==

###.query()

[Back to top](#api-reference)

**Description:** Query data from a specific store.

    .query(keyRange, index, storeName, pageIndex, itemsPerPage, direction, successHandler, errorHandler)

**Parameter:** `keyRange`

**Type:** `IDBKeyRange` [Read more](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange)

**Description:** A range of keys in a specific store [read more](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange).
 Set to `null` to query all keys.

==

**Parameter:** `index`

**Type:** `String`

**Description:** Query key range based on a specific index.

==

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `pageIndex`

**Type:** `Number`

**Description:** Page index, works with `itemsPerPage` to help you setup a paging system.

==

**Parameter:** `itemsPerPage`

**Type:** `Number`

**Description:** Limit query to a specific number of items. If `itemsPerPage` is not set, query will return all records.

==

**Parameter:** `direction`

**Type:** `String`

**Description:** Cursor direction: `next` (default), `nextunique`, `prev` and `prevunique`
 [read more](https://developer.mozilla.org/en-US/docs/Web/API/IDBCursor.direction).

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.

==

###.queryMultipleKeys()

[Back to top](#api-reference)

**Description:** Query data from a specific store using an array of keys.

    .queryMultipleKeys(keys, index, storeName, successHandler, errorHandler)

**Parameter:** `keys`

**Type:** `Array`

**Description:** An array of keys to query from a store.

==

**Parameter:** `index`

**Type:** `String`

**Description:** Query key range based on a specific index.

==

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.

==

###.remove()

[Back to top](#api-reference)

**Description:** Insert data into a specific store.

    .remove(key, storeName, successHandler, errorHandler)

**Parameter:** `key`

**Type:** `String|Number`

**Description:** Key of an item in the store.

==

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.

==

###.update()

[Back to top](#api-reference)

**Description:** Insert data into a specific store.

    .update(value, key, storeName, successHandler, errorHandler)

**Parameter:** `value`

**Type:** `Object`

**Description:** A data object that will get inserted into the database.

==

**Parameter:** `key`

**Type:** `String|Number`

**Description:** Key of an item in the store.

==

**Parameter:** `storeName`

**Type:** `String`

**Description:** Name of a Store in the Database.

==

**Parameter:** `successHandler`

**Type:** `function(event, data) {}`

**Description:** A function to call when the request finishes. The function get passed 2 parameters: the `Event` and the
 `Data`.

==

**Parameter:** `errorHandler`

**Type:** `function(event) {}`

**Description:** A function to call when the request fails. The function get passed 1 parameter: the `Event`.