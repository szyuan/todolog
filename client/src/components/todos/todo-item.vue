<template>
<div class="todo-item" :class="{ editing: editing, chosen: chosen}">
    <div class="checkbox">
        <Checkbox v-model="todo.done"></Checkbox>
    </div>
    <div class="title" @dblclick="edit">
        <div v-show="!editing" class="title-content">
            <h2>{{todo.title}}</h2>
        </div>
        <Input v-focus class="edit-input" @on-enter="saveChange" @on-blur="saveChange" v-if="editing" v-model="todo.title" type="text" size="large" placeholder="新增事项"></Input>
    </div>
    <div class="tag">
        <Tag>{{todo.type}}</Tag>
    </div>
    <div class="delete">
        <Button v-on:click="test" type="text" size="small" shape="circle" icon="backspace-outline"></Button>
    </div>
</div>
</template>

<script>
export default {
    props: {
        todo: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            editing: false,
            chosen: false
        }
    },
    methods: {
        edit() {
            this.editing = true;
        },
        saveChange() {
            this.editing = false;
        },
        test() {
            alert();
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