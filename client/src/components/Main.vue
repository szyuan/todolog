<template>
<div id="main">
    <div class="container">
        <div class="new-todo-wrapper">
            <Row class="new-todo">
                <Col span="2">
                        <Button type="text" size="large" shape="circle" icon="plus-round"></Button>
                </Col>
                <Col span="22">
                        <Input v-model="newTodo.title" @on-enter="addNewTodo" type="text" size="large" placeholder="新增事项"></Input>
                </Col>
            </Row>
        </div>
        
        <div class="todos-ctrl-wrapper">
            <Row :gutter="16">
                <Col span="14">
                    <div class="todo-list-wrapper">
                        <todo-list @selectTodo="selectTodoHandler" :todos="todos" :new-todo="newTodo"></todo-list>
                    </div>
                </Col>
                <Col span="10">
                    <div class="control-wrapper">
                        <div class="tag-list-wrapper">
                            <Tag-list :tags="tags" :new-todo="newTodo"></Tag-list>
                        </div>
                        <div class="timer-wrapper">
                            <Timer :todo="timerTodo" @statusChange="timerStatusChange"></Timer>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>

        <Row>
            <div class="done-list-wrapper">
                <done-list :todos="todos" ></done-list>
            </div>
        </Row>
    </div>
</div>
</template>

<script>
import todoList from '@comp/todos/todo-list';
import doneList from '@comp/todos/done-list';
import TagList from '@comp/tags/tag-list';
import timer from '@comp/timer/timer.vue';

const HTTP_OK = 0;

export default {
  name: 'main',
  data: function() {
    return {
        todos: [],
        tags: [],
        newTodo: {id:null, title:"",tagID: 0, done: 0},
        selectedTodo: null,
        timerStatus: 3,
				timerTodo: null,
				timerTodoInited: false
    };
  },
  computed: {
      gotTodos: function() {
          return Boolean(this.todos.length);
      }
  },
	watch: {
		// 监听todos变化，初始化timerTodo
		todos() {
			// 只运行一次
			if(!this.timerTodoInited){
				this.timerTodoInited = true;
				let tickingTodo = this.todos.filter((item) => {
					return (item.status === 1);
				});
				if(tickingTodo.length > 0){
					this.timerTodo = tickingTodo[0];
					this.timerStatus = 1;
				}else {
					this.timerTodo = null;
				}
			}else{console.log('todos changed')}
		}
	},
  methods: {
			test() {
				alert();
			},
      todoValidate(todo) {
        let title = todo.title;
        if(title) {
            if(typeof title === 'string') {
                if(title.trim().length > 0) {
                    return true;
                }
            }
        }
        return false;
      },
      // 添加新todo操作
      addNewTodo() {
        var _this = this;
        // 验证数据合法性
        if(this.todoValidate(this.newTodo)){
            // 先进行post请求
            this.$http.put('/api/todos', {"newTodo": this.newTodo}).then((res) => {
                if(res.ok) {
                    // put后返回成功插入后的数据ID，将数据推入当前的todo数据数组
                    let todoID = res.body.id;
                    _this.addTodoDOM(todoID,_this.newTodo);
                    console.log('新增todo成功');
                    _this.resetTodo();
                }else {
                    console.log('新增todo失败');
                }
            });
        }else {
            // console.log()
        }
      },
      addTodoDOM(todoID,newTodo) {
        let newTodoData = {};
        newTodoData.title = newTodo.title;
        newTodoData.done = newTodo.done;
        newTodoData.tagname = this.getNameByTagID(newTodo.tagID);
        newTodoData.id = todoID;
        this.todos.unshift(newTodoData);
      },
      getNameByTagID(tagID) {
        let result = this.tags.filter((item, index, arr) => {
            if(item.id === tagID) {
                return true;
            }
        })[0].name;
        console.log(result);
        return result;
      },
      resetTodo() {
          this.newTodo = {id: null, title: "",tagID: 0, done: 0};
      },
      selectTodoHandler(arg) {
        let todo = arg.todo;
        this.selectedTodo = todo;
				// 如果timer的状态为3，则代表无数据，可以更改timer的todo
        if(this.timerStatus === 3) {
            // 更换timerTodo
						this.timerTodo = todo;
        }
      },
			timerStatusChange(status) {
				this.timerStatus = status;
				console.log('main.timerstatus: '+this.timerStatus);
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
    Timer: timer,
    doneList
  }
}
</script>

<style lang="scss">
    @import '../common/scss/index.scss';

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

            .todo-list-content {
                min-height: 22rem;
            }
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

    .done-list-wrapper {
        box-shadow: $boxShadow;
        padding: 1rem;
    }
</style>