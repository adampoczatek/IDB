window.todo = {};

(function (base) {
    "use strict";

    base._elements = {
        addTask: document.getElementById("add-task"),
        taskContent: document.getElementById("task-content"),
        taskList: document.getElementById("task-list"),
        taskTitle: document.getElementById("task-title")
    };

    base._templates = {
        tasks: document.getElementById("tasks-template").innerHTML
    };

    base.initialise = function () {
        base.compileTemplates(base._templates);

        base.initialiseControls();

        var idb = new window.IDB({
            db: "Todos",
            version: 1,
            stores: [
                {
                    name: "tasks",
                    keyPath: "postDate",
                    schema: {
                        title: { unique: false },
                        content: { unique: false },
                        postDate: { unique: true },
                        done: { unique: false }
                    }
                }
            ]
        },
        function() {
            base.db = this;

            base.getTasks();
        },
        function(e) {
            window.console.error("Failed to open DB!", e);
        });
    };

    base.initialiseControls = function() {
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("task-delete")) {
                base.Events.removeTask(e);
            }
        }, false);

        document.addEventListener("change", function(e) {
            if (e.target.classList.contains("task-done")) {
                base.Events.markAsDone(e);
            }
        }, false);

        base._elements.addTask.addEventListener("click", base.Events.addTask, false);
    };

    base.compileTemplates = function (templates) {
        var key;

        for (key in templates) {
            if (templates.hasOwnProperty(key)) {
                templates[key] = window.Handlebars.compile(templates[key]);
            }
        }
    };

    base.getTasks = function() {
        base.db.query(null, null, "tasks", 0, 0, "next", function(e, data) {
            base._elements.taskList.innerHTML = base._templates.tasks({ tasks: data });
        }, function (e) {
            window.console.error("Failed to load tasks!", e);
        });
    };

    base.Events = {
        addTask: function () {
            var data = {
                title: base._elements.taskTitle.value,
                content: base._elements.taskContent.value,
                postDate: new Date().getTime(),
                done: false
            };

            base.db.insert(data, false, "tasks", function() {
                window.console.info("Task added!");

                base.getTasks();
            }, function (e) {
                window.console.error("Failed to add task!", e);
            });
        },
        markAsDone: function (e) {
            var id = parseFloat(e.target.dataset.id),
                data = {
                    done: e.target.checked
                };

            base.db.update(data, id, "tasks", function() {
                window.console.info("Task updated!");
            }, function (e) {
                window.console.error("Failed to update task", e);
            });
        },
        removeTask: function (e) {
            var id = parseFloat(e.target.dataset.id);

            base.db.remove(id, "tasks", function() {
                window.console.info("Task removed!");

                base.getTasks();
            }, function (e) {
                window.console.error("Failed to remove task!", e);
            });
        }
    };

})(window.todo);