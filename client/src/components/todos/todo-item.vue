<template>
<div class="todo-item" :class="{ editing: editing, chosen: chosen, done: todoDone}">
    <div class="checkbox">
        <Checkbox @on-change="toggleCheck" v-model="todoDone"></Checkbox>
    </div>
    <div class="title" @dblclick="edit">
        <div v-show="!editing" class="title-content">
            <h2>{{todo.title}}</h2>
        </div>
        <Input v-focus class="edit-input" @on-enter="saveChange" @on-blur="saveChange" v-if="editing" v-model="todo.title" type="text" size="large" placeholder="新增事项"></Input>
    </div>
    <div class="tag">
        <Tag>{{todo.tagname}}</Tag>
    </div>
    <div class="delete">
        <Button v-on:click="showConfirm = true" type="text" size="small" shape="circle" icon="backspace-outline"></Button>
    </div>

    <Modal
        v-model="showConfirm"
        title="确认删除这个事项？"
        @on-ok="deleteTodo">
        <p>删除了就没法恢复了哦...</p>
    </Modal>
</div>
</template>

<script>
export default {
    props: {
        todo: {
            type: Object,
            default: {}
        },
        index: Number
    },
    data() {
        return {
            editing: false,
            chosen: false,
            showConfirm: false
        };
    },
    computed: {
        todoDone: function() {
            return Boolean(this.todo.done);
        }
    },
    methods: {
        edit() {
            this.editing = true;
        },
        saveChange() {
            this.editing = false;
        },
        deleteTodo() {
            let _this = this;
            // alert(_this.index);
            this.$emit('delete', {id:_this.todo.id, index:_this.index});
        },
        toggleCheck() {
            if(this.todo.done === 1) {
                this.todo.done = 0;
            }else {
                this.todo.done = 1;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.todo-item {
    position:relative;
    border-bottom: 1px solid #ddd;
    min-height: 3.5rem;

    &.editing {
        background: #f9f9f9;
    }

    &:hover {
        .delete {
            display: block;
        }
    }
    &.done {
        .title h2 {
            text-decoration: line-through;
            color: #ccc;
        }
    }
}

.tag, .checkbox, .delete {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
    height: 30px;
    margin: auto 0;
    line-height: 30px;
    text-align: center;
}
.checkbox {
    left: 0;
    // background: green;
}
.title {
    overflow: hidden;
    box-sizing: border-box;
    margin: 0 100px 0 50px;
    
    .title-content {
        overflow: hidden;
        margin: 0.8rem 0;
        box-sizing: border-box;
        
        h2 {
            font-weight: 400;
            transition: 0.5s color;
        }
    }
    .edit-input {
        margin-top: 11px;
    }
}
.tag {
    right: 40px;
    // background: orange;
}
.delete {
    display: none;
    right: 0.5rem;
    width: 30px;
    // background: firebrick;
}
</style>