<template>
<div id="main">
    <div class="container">
        <div class="new-todo-wrapper">
            <Row class="new-todo">
                <Col span="2">
                        <Button type="text" size="large" shape="circle" icon="plus-round"></Button>
                </Col>
                <Col span="22">
                        <Input type="text" size="large" placeholder="新增事项"></Input>
                </Col>
            </Row>
        </div>
        
        <div class="todos-ctrl-wrapper">
            <Row :gutter="16">
                <Col span="14">
                    <div class="todo-list-wrapper">
                        <todo-list :todos="todos" :new-todo="newTodo"></todo-list>
                    </div>
                </Col>
                <Col span="10">
                    <div class="control-wrapper">
                        <div class="tag-list-wrapper">
                            <Tag-list :tags="tags" :new-todo="newTodo"></Tag-list>
                        </div>
                        <div class="timer-wrapper">
                            <Timer></Timer>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>

        <Row>
            <div class="history-wrapper">
                <!-- history-list></history-list -->
            </div>
        </Row>
    </div>
</div>
</template>

<script>
import todoList from '@comp/todos/todo-list';
import TagList from '@comp/tags/tag-list';
import timer from '@comp/timer/timer.vue';

const HTTP_OK = 0;

export default {
  name: 'main',
  data: function() {
    return {
        todos: [],
        tags: [],
        newTodo: {title:"",type: ""}
    };
  },
  computed: {
      gotTodos: function() {
          return Boolean(this.todos.length);
      }
  },
  created: function() {
    // 请求todos数据
    this.$http.get('/api/todos').then((response) => {
        let resBody = response.body;
        if (response.ok) {
            this.todos = resBody;
        }else {
            console.log('todos请求失败');
        }
    });
    // 请求tags数据
    this.$http.get('/api/tags').then((response) => {
        let resBody = response.body;
        if (response.ok) {
            this.tags = resBody;
        }else {
            console.log('tags请求失败');
        }
    });
  },
  components: {
    todoList,
    TagList,
    Timer: timer
  }
}
</script>

<style lang="scss">
    @import '../common/scss/var.scss';

    #main {
        margin: 1rem;
    }
    .container {
        max-width: 1200px;
        margin: 1rem auto;
        padding: 1rem;
        background: #fff;
    }

    .new-todo-wrapper {
        // border: 1px solid #ddd;
        box-shadow: $boxShadow;
        padding: 1rem;
    }
    .todos-ctrl-wrapper {
        margin: 1rem 0;

        .todo-list-wrapper {
            height: 24rem;
            padding: 1rem;
            // border: 1px solid #ddd;
            box-shadow: $boxShadow;
            overflow: auto;
            // background: yellow;
        }

        .control-wrapper {
            height: 24rem;
                box-shadow: $boxShadow;
            .tag-list-wrapper {
                padding: 0.5rem;
            }
            .timer-wrapper {
                // box-shadow: $boxShadow;
                margin: 1rem 0 0 0;
                text-align: center;
            }
        }
    }
</style>