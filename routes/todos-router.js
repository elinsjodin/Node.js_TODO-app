const express = require("express");
const router = express.Router();
const db = require("../database.js");
const utils = require("../utils.js");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
  const todosCollection = await db.getTodosCollection();
  const todos = await todosCollection.find().toArray();

  res.render("todos/todos-list", { todos });
});

router.get("/newest", async (req, res) => {
  const todosCollection = await db.getTodosCollection();
  const todos = await todosCollection.find().sort({ created: -1 }).toArray();

  res.render("todos/todos-list", { todos });
});

router.get("/oldest", async (req, res) => {
  const todosCollection = await db.getTodosCollection();
  const todos = await todosCollection.find().sort({ created: 1 }).toArray();

  res.render("todos/todos-list", { todos });
});

router.get("/completed", async (req, res) => {
  const todosCollection = await db.getTodosCollection();
  const todos = await todosCollection.find({ done: true }).toArray();

  res.render("todos/todos-list", { todos });
});

router.get("/uncompleted", async (req, res) => {
  const todosCollection = await db.getTodosCollection();
  const todos = await todosCollection.find({ done: false }).toArray();

  res.render("todos/todos-list", { todos });
});

router.get("/new", async (req, res) => {
  res.render("todos/todos-create");
});

router.post("/new", async (req, res) => {
  const todo = {
    created: new Date().toLocaleString(),
    task: req.body.task,
    done: false,
    checkbox: req.body.checkbox,
  };

  if (utils.validateTask(todo)) {
    const todosCollection = await db.getTodosCollection();
    const sameTask = await todosCollection
      .find({ task: req.body.task })
      .toArray();

    if (sameTask.length > 0) {
      res.render("todos/todos-create", {
        error: "'" + todo.task + "'" + " already exists",
        ...todo,
      });
    } else {
      res.redirect("/");
      await todosCollection.insertOne(todo);
    }
  } else {
    res.render("todos/todos-create", {
      error: "Kindly add task",
      ...todo,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  if (id) {
    const todosCollection = await db.getTodosCollection();
    todosCollection.findOne({ _id: id }, (err, todo) => {
      if (todo) {
        res.render("todos/todos-single", todo);
      } else {
        next();
      }
    });
  }
});

router.get("/:id/delete", async (req, res) => {
  const id = ObjectId(req.params.id);

  const todosCollection = await db.getTodosCollection();

  todosCollection.findOne({ _id: id }, (err, todo) => {
    res.render("todos/todos-delete", todo);
  });
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }
  if (id) {
    const todosCollection = await db.getTodosCollection();
    await todosCollection.deleteOne({ _id: id });
  }
  res.redirect("/");
});

router.get("/:id/edit", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  if (id) {
    const todosCollection = await db.getTodosCollection();
    todosCollection.findOne({ _id: id }, (err, todo) => {
      if (todo) {
        res.render("todos/todos-edit", todo);
      } else {
        next();
      }
    });
  }
});

router.post("/:id/edit", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  if (id) {
    const todo = {
      created: new Date().toLocaleString(),
      task: req.body.task,
      done: false,
      checkbox: req.body.checkbox,
    };

    if (todo.checkbox === "on") {
      todo.done = true;
    } else {
      todo.done = false;
    }

    if (utils.validateTask(todo)) {
      const todosCollection = await db.getTodosCollection();
      const sameTask = await todosCollection
        .find({ task: req.body.task })
        .toArray();
      if (sameTask.length > 0 && !id.equals(sameTask[0]._id)) {
        res.render("todos/todos-edit", {
          error: "'" + todo.task + "'" + " already exists",
          ...todo,
        });
      } else {
        res.redirect("/todos/" + id);
        await todosCollection.updateOne({ _id: id }, { $set: todo });
      }
    } else {
      res.render("todos/todos-edit", {
        error: "Kindly add task",
        _id: id,
        ...todo,
      });
    }
  }
});

module.exports = router;
