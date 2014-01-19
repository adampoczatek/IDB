/**
 * @author Adam Poczatek <hello.adaz@gmail.com>
 * @version 1.0.1
 *
 * Last update: Sun, 19 January 2014
 */

(function(window) {
    "use strict";

    var formatResult, processRequest;

    /**
     * TODO: Make sure it works on all browsers that support indexedDB
     */

    /**
     * @param {Object} setup Object containing information about Database and Stores.
     *
     * Example:
     * {
     *   db: "MyDatabaseName",
     *   version: 1,
     *   stores: [{
     *     name: "MyStoreName",
     *     keyPath: "name",
     *     schema: {
     *       name: { unique: false },
     *       age: { unique: false },
     *       email: { unique: true }
     *     }
     *   }]
     * }
     *
     * @param {function(Object)=} onDbReady Function called when the Database has successfully opened.
     * @param {function(Object)=} errorHandler Function called when the Database has failed to open.
     * @constructor
     */

    window.IDB = function(setup, onDbReady, errorHandler) {
        var instance = this,
            request;

        this.setup = setup;

        if (!this.setup.db ||
            !this.setup.version ||
            !this.setup.stores ||
            !this.setup.stores.length) {

            if (typeof errorHandler === "function") {
                errorHandler.call(this, { errorMessage: "Database Name and/or Store is not defined." });
            }

            return;
        }

        request = window.indexedDB.open(this.setup.db, this.setup.version);

        request.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, e);
            }
        };

        request.onsuccess = function (e) {
            instance.db = e.target.result;

            if (typeof onDbReady === "function") {
                onDbReady.call(instance, e);
            }
        };

        request.onupgradeneeded = function (e) {
            var db = e.target.result,
                column, objectStore, store, i, l, key;

            /**
             * Loop through the `setup.stores` array and create new object store for
             * each item.
             */

            for (i = 0, l = instance.setup.stores.length; i < l; i++) {
                store = instance.setup.stores[i];

                /**
                 * Check if this store already exists and delete it.
                 * TODO: Export old data.
                 */

                if (db.objectStoreNames.contains(store.name)) {
                    db.deleteObjectStore(store.name);
                }

                objectStore = db.createObjectStore(store.name, store.keyPath ? {
                    keyPath: store.keyPath
                } : {
                    autoIncrement: true
                });

                for (key in store.schema) {
                    if (store.schema.hasOwnProperty(key)) {
                        column = store.schema[key];

                        objectStore.createIndex(key, key, {
                            unique: !!(column && typeof column === "object" && column.unique)
                        });
                    }
                }
            }

            e.target.transaction.onerror = function (e) {
                if (typeof errorHandler === "function") {
                    errorHandler.call(instance, e);
                }
            };
        };
    };

    /**
     * @param {function(data)} successHandler Function called when the export is ready.
     */

    window.IDB.prototype.exportData = function (successHandler) {
        var instance = this,
            iterations = 0,
            objectStoreNames = this.db.objectStoreNames,
            result = {},
            objectStoreName, queryData, i, l;

        queryData = function() {
            objectStoreName = objectStoreNames[iterations];

            if (objectStoreName) {
                instance.query(null, null, objectStoreName, 0, 0, "next", function (e, data) {
                    result[objectStoreName] = data;

                    iterations++;

                    queryData();
                });
            }
            else {
                if (typeof successHandler === "function") {
                    successHandler.call(instance, result);
                }
            }
        };

        queryData();
    };

    /**
     * @param {String} storeName Store name.
     * @param {function(Object, Array)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.getStoreInfo = function (storeName, successHandler, errorHandler) {
        var instance = this,
            objectStore = this.openStore(storeName, "readonly"),
            count = objectStore.count();

        count.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, e);
            }
        };

        count.onsuccess = function (e) {
            if (typeof successHandler === "function") {
                successHandler.call(instance, e, {
                    store: objectStore,
                    count: e.target.result
                });
            }
        };
    };

    /**
     * @param {Object} importData An object with data that will go into the database.
     * @param {function(Object)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.importData = function (importData, successHandler, errorHandler) {
        var instance = this,
            iterations = 0,
            storeNames = Object.keys(importData),
            data, insertData, storeName;

        insertData = function () {
            storeName = storeNames[iterations];

            data = importData[storeName];

            if (storeName && data) {
                instance.insert(data, true, storeName, function() {
                    iterations++;

                    insertData();
                }, function(e) {
                    if (typeof errorHandler === "function") {
                        errorHandler.call(instance, e);
                    }
                });
            }
            else {
                if (typeof successHandler === "function") {
                    successHandler.call(instance, importData);
                }
            }
        };

        insertData();
    };

    /**
     * @param {(Object|Array)} value Data that will go into the database.
     * @param {Boolean} overwrite Boolean indicating whether to overwrite exising items or not.
     * @param {String} storeName String representing database store.
     * @param {function(Object)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.insert = function (value, overwrite, storeName, successHandler, errorHandler) {
        var instance = this,
            objectStore = this.openStore(storeName, "readwrite"),
            method = overwrite ? "put" : "add",
            iterations = 0,
            request, insertData;

        if (value.length) {
            insertData = function () {
                request = objectStore[method](value[iterations]);

                request.onerror = function (e) {
                    if (typeof errorHandler === "function") {
                        errorHandler.call(instance, e);
                    }
                };

                request.onsuccess = function (e) {
                    iterations++;

                    if (value[iterations]) {
                        insertData();
                    }
                    else {
                        if (typeof successHandler === "function") {
                            successHandler.call(instance, e);
                        }
                    }
                };
            };

            insertData();
        }
        else {
            request = objectStore[method](value);

            processRequest(request, successHandler, errorHandler);
        }
    };

    /**
     * @param {String} storeName String representing Store in the Database.
     * @param {String=} mode
     */

    window.IDB.prototype.openStore = function(storeName, mode) {
        var objectStore, transaction;

        if (!mode ||
            mode !== "readwrite" ||
            mode !== "readonly") {

            mode = "readwrite";
        }

        transaction = this.db.transaction([storeName], mode);

        objectStore = transaction.objectStore(storeName);

        return objectStore;
    };

    /**
     * @param {Object} keyRange IDBKeyRange.
     * @param {String} index String representing index in the database.
     * @param {String} storeName String representing database store.
     * @param {Number=} pageIndex Requested page index.
     * @param {Number=} itemsPerPage Number of items per page (0 === All items).
     * @param {String} direction Cursor direction.
     * @param {function(Object, Array)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.query = function (keyRange, index, storeName, pageIndex, itemsPerPage, direction, successHandler, errorHandler) {
        var instance = this,
            itemsAdded = 0,
            data = [],
            directions = {
                "next": "next",
                "nextunique": "nextunique",
                "prev": "prev",
                "prevunique": "prevunique"
            },
            objectStore = this.openStore(storeName, "readonly"),
            advance = pageIndex * itemsPerPage,
            request;

        if (!directions[direction]) {
            direction = directions.next;
        }

        objectStore = index ? objectStore.index(index) : objectStore;

        request = objectStore.openCursor(keyRange, direction);

        request.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, e);
            }
        };

        request.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
                if (advance) {
                    cursor.advance(advance);

                    advance = 0;

                    return;
                }

                if (!itemsPerPage ||
                    (itemsPerPage && itemsAdded) < itemsPerPage) {

                    data.push(formatResult(cursor));

                    itemsAdded++;

                    cursor["continue"]();

                    return;
                }
            }

            if (typeof successHandler === "function") {
                successHandler.call(instance, e, data);
            }
        };
    };

    /**
     * @param {Array.<string>} keys An array of keys.
     * @param {String} index String representing index in the database.
     * @param {String} storeName String representing database store.
     * @param {function(Object, Array)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.queryMultipleKeys = function (keys, index, storeName, successHandler, errorHandler) {
        var instance = this,
            count = 0,
            result = [],
            limit, getNextItem;

        if (keys.length) {
            limit = keys && typeof keys === "object" && keys.length;

            result = [];

            getNextItem = function(e) {
                var i, l;

                if (count < limit) {
                    instance.query(window.IDBKeyRange.only(keys[count]), index || null, storeName, 0, 0, function(e, data) {
                        if (data.length) {
                            for (i = 0, l = data.length; i < l; i++) {
                                result.push(formatResult({
                                    value: data[i].value,
                                    key: keys[count]
                                }));
                            }
                        }

                        count++;

                        getNextItem(e);
                    });
                }
                else {
                    if (typeof successHandler === "function") {
                        successHandler.call(instance, e, result);
                    }
                }
            };

            getNextItem();
        }
        else {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, { errorMessage: "Keys not provided." });
            }
        }
    };

    /**
     * @param {(Number|String|Array)} key Key (or an array of keys) of an item in the database.
     * @param {String} storeName String representing database store.
     * @param {function(Object)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.remove = function (key, storeName, successHandler, errorHandler) {
        var instance = this,
            objectStore = this.openStore(storeName, "readwrite"),
            iterations = 0,
            request, removeData;

        if (key.length) {
            removeData = function () {
                request = objectStore["delete"](key[iterations]);

                request.onerror = function (e) {
                    if (typeof errorHandler === "function") {
                        errorHandler.call(instance, e);
                    }
                };

                request.onsuccess = function (e) {
                    iterations++;

                    if (key[iterations]) {
                        removeData();
                    }
                    else {
                        if (typeof successHandler === "function") {
                            successHandler.call(instance, e);
                        }
                    }
                };
            };

            removeData();
        }
        else {
            request = objectStore["delete"](key);

            processRequest(request, successHandler, errorHandler);
        }
    };

    /**
     * @param {Object} value Object containt data that will go into the database.
     * @param {String} key Key of an item in the database.
     * @param {String} storeName String representing database store.
     * @param {function(Object, Array)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     */

    window.IDB.prototype.update = function (value, key, storeName, successHandler, errorHandler) {
        var instance = this,
            objectStore = this.openStore(storeName, "readwrite"),
            request = objectStore.openCursor(IDBKeyRange.only(key)),
            data = [];

        request.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, e);
            }
        };

        request.onsuccess = function (e) {
            var cursor = e.target.result,
                item;

            if (cursor) {
                for (item in cursor.value) {
                    if (cursor.value.hasOwnProperty(item) && value[item]) {
                        cursor.value[item] = value[item];
                    }
                }

                cursor.update(cursor.value);

                data.push(formatResult(cursor));

                cursor["continue"]();
            }
            else {
                if (typeof successHandler === "function") {
                    successHandler.call(instance, e, data);
                }
            }
        };
    };

    /**
     * @param {Object} result Object - raw data from the database.
     * @private
     */

    formatResult = function (result) {
        return result ? result.value : undefined;
    };

    /**
     * @param {Object} request IDBRequest object.
     * @param {function(Object)=} successHandler Function called on success.
     * @param {function(Object)=} errorHandler Function called on error.
     * @private
     */

    processRequest = function (request, successHandler, errorHandler) {
        var instance = this;

        request.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler.call(instance, e);
            }
        };

        request.onsuccess = function (e) {
            if (typeof successHandler === "function") {
                successHandler.call(instance, e);
            }
        };
    };

})(window);