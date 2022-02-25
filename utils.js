function validateTask(todo) {
  let valid = true;

  valid = valid && todo.task;
  valid = valid && todo.task.length > 0;

  return valid;
}

module.exports = { validateTask };
