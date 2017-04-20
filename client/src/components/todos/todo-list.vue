<template>
<div class="todo-list">
    <div @click.self="cleanSelect" class="todo-list-content">
        <todo-item @selected="selectTodo" @delete="deleteTodo" v-for="(todo, index) in activeTodos" :key="todo.id" :todo="todo" :index="index"></todo-item>
    </div>
</div>
</template>

<script>
import todoItem from '@comp/todos/todo-item'

export default {
    props: {
        todos: {
            type: Array,
            required: true
        }
    },
    computed: {
        todosData() {
            return this.todos;
        },
        activeTodos() {
            let todos = this.todos;
            let activeTodos = todos.filter((item, index, arr) => { 
                return Boolean(item.done === 0);
            });
            return activeTodos;
        }
    },
    data() {
        return {
            listType: "todo-list",
            lastSeletedItem: null
        }
    },
    methods: {
        deleteTodo(todoInfo) {
            var _this = this;
            var id = todoInfo.id;
            var index = todoInfo.index;
            this.$http.delete('/api/todos/'+id).then((res) => {
                if(res.ok) {
                    _this.todos.splice(index,1);
                }
            });
        },
        selectTodo(arg) {
            var el = arg.el;
            this.lastSeletedItem&&this.lastSeletedItem.classList.remove('selected');
            el.classList.add('selected');
            this.lastSeletedItem = el;

            this.$emit('selectTodo',arg);
        },
        cleanSelect() {
            this.$el.querySelectorAll('.todo-item').forEach((item)=>{
                item.classList.remove('selected');
            });
        }
    },
    components: {
        todoItem
    },
    created() {

    }
}
</script>

<style lang="scss">
.todo-list {
    border-bottom: 0;

    .todo-item.selected {
        background: #fcfcfc;
    }
}
</style>