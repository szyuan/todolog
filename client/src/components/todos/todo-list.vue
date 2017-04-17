<template>
<div class="todo-list">
    <todo-item v-for="todo in activeTodos()" :key="todo.id" :todo="todo"></todo-item>
</div>
</template>

<script>
import todoItem from '@comp/todos/todo-item'

export default {
    computed: {
    },
    data() {
        return {
        }
    },
    props: {
        todos: {
            type: Array,
            required: true
        }
    },
    methods: {
        activeTodos: function() {
            return this.todos.filter((item,index,arr) => { return true; });
        }
    },
    components: {
        todoItem
    }
}
</script>

<style>
.todo-list {
    // background: yellow;
    // border: 1px solid #ddd;
    // margin: 1rem 0;
    border-bottom: 0;
}
</style>