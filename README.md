# IDB - indexedDB Wrapper

IDB is a simple wrapper for indexedDB API available in HTML5. The idea of this script is to help you organise your indexedDB connections and transactions, and to avoid code repetition.

## Basic Usage

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
    
    // TODO: Documentation

## API Reference

###.getStoreInfo()

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

**Description:** Insert data into a specific store.

    .insert(value, overwrite, storeName, successHandler, errorHandler)

**Argument:** `value`

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


a
