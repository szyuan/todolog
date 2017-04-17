<template>
<div class="todo-list">
    <todo-item @delete="deleteTodo" v-for="(todo, index) in doneTodos()" :key="todo.id" :todo="todo" :index="index"></todo-item>
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
        doneTodos: function() {
            return this.todos.filter((item,index,arr) => { return item.done==1; });
        },
        deleteTodo: function(todoInfo) {
            var _this = this;
            var id = todoInfo.id;
            var index = todoInfo.index;
            this.$http.delete('/api/todos/'+id).then((res) => {
                if(res.ok) {
                    _this.todos.splice(index,1);
                }
            });
        }
    },
    components: {
        todoItem
    },
    events: {
        'todoItem.delete'(todoInfo) {
            alert(todoInfo.index)
        }
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