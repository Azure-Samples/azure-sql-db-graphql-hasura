export async function getTodos() {
  const req = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `
        query {
          todo {
            id
            description
            is_completed
          }
        }
      `,
    }),
  })
  const res = await req.json()
  return res?.data?.todo
}

export async function createTodo(description) {
  const req = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `
        mutation CreatTodo($description: String!) {
          insert_todo_one(object: {
             description: $description
          }) {
            id
            description
            is_completed
          }
        }
      `,
      variables: {
        description,
      },
    }),
  })
  const res = await req.json()
  return res?.data?.insert_todo_one
}

export async function deleteTodoById(id) {
  const req = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `
        mutation DeleteTodoByPk($id: Int!) {
          delete_todo_by_pk(id: $id) {
            id
          }
        }
      `,
      variables: {
        id,
      },
    }),
  })
  const res = await req.json()
  return res?.data?.delete_todo_by_pk
}

export async function updateTodo(todo) {
  const req = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: `
        mutation UpdateTodo($id: Int!, $todo_set_input: todo_set_input!) {
          update_todo_by_pk(
            pk_columns: { id: $id },
            _set: $todo_set_input
        ) {
            id
            description
            is_completed
        }
      }
      `,
      variables: {
        id: todo.id,
        todo_set_input: todo,
      },
    }),
  })
  const res = await req.json()
  return res?.data?.update_todo_by_pk
}
