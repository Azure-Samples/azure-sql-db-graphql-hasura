<template>
  <img alt="Vue logo" src="./assets/logo.png" />

  <p>Create New Todo</p>
  <label for="todo-description">Description</label>
  <input name="todo-description" v-model="state.newTodoDescription" />
  <button @click="createTodo(state.newTodoDescription).then(getAndSetTodos)">
    Create
  </button>

  <hr />

  <p>Completed Todos</p>
  <div :key="todo.id" v-for="todo in completedTodos">
    <p>{{ todo.id }} | {{ todo.description }}</p>
  </div>

  <hr />

  <h1 v-if="state.todos.length == 0">No todos</h1>
  <section v-else>
    <div :key="todo.id" v-for="todo in state.todos">
      <p>ID: {{ todo.id }}</p>
      <input v-model="todo.description" />
      <input
        type="checkbox"
        v-model="todo.is_completed"
        :checked="todo.is_completed"
        @change="updateTodo(todo)"
      />
      <button @click="updateTodo(todo)">Update</button>
      <button @click="deleteTodoById(todo.id)">Delete</button>
    </div>
  </section>
</template>

<script>
import { defineComponent, reactive, onMounted, computed } from "vue"
import { getTodos, createTodo, updateTodo, deleteTodoById } from "./utils"

export default defineComponent({
  setup() {
    const state = reactive({
      newTodoDescription: "",
      todos: [],
    })

    const completedTodos = computed(() =>
      state.todos.filter((it) => it.is_completed)
    )

    async function getAndSetTodos() {
      const todos = await getTodos()
      state.todos = todos
    }

    onMounted(async () => {
      getAndSetTodos()
    })

    return {
      state,
      completedTodos,
      deleteTodoById,
      updateTodo,
      createTodo,
      getAndSetTodos,
    }
  },
})

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
