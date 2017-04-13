<template>
<div id="todo-list">
    <todo-item v-for="todo in activeTodos" :key="todo.id" :todo="todo"></todo-item>
</div>
</template>

<script>
import todoItem from '@comp/todos/todo-item'

export default {
    computed: {
        activeTodos: function() {
            return this.todos.filter((item,index,arr) => {
                return !item.done;
            });
        }
    },
    props: {
        todos: {
            type: Array,
            required: true
        }
        // todos: null
    },
    components: {
        todoItem
    }
}
</script>

<style>
#todo-list {
    // background: yellow;
    // border: 1px solid #ddd;
    // margin: 1rem 0;
    border-bottom: 0;
}
</style>