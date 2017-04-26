<template>
<div id="main">
    <div class="container">
        <div class="new-todo-wrapper">
            <Row :gutter="16" class="new-todo">
                <Col :xs="3" :sm="2"class="new-btn-col">
                        <Button @click="addNewTodo" type="text" size="large" shape="circle" icon="plus-round"></Button>
                </Col>
                <Col :xs="21" :sm="22">
                        <Input v-model="newTodo.title" @on-enter="addNewTodo" @on-change="inputChange" type="text" size="large" placeholder="新增事项"></Input>
                </Col>
            </Row>
        </div>
        
        <div class="todos-ctrl-wrapper">
            <Row :gutter="16">
                <Col :xs="24" :sm="14">
                    <div class="todo-list-wrapper">
                        <todo-list @selectTodo="selectTodoHandler" :todos="todos" :new-todo="newTodo" :setTag="setTag"></todo-list>
                    </div>
                </Col>
                <Col :xs="24" :sm="10">
                    <div class="control-wrapper">
                        <div class="tag-list-wrapper">
                            <Tag-list @radioChange="radioChange" :tags="tags" :new-todo="newTodo"></Tag-list>
                        </div>
                        <div class="timer-wrapper">
                            <Timer :todo="timerTodo" @statusChange="timerStatusChange" @startTagTodo="startTagTodo"></Timer>
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

import bus from '../common/event-bus';

const HTTP_OK = 0;

export default {
  name: 'main',
  data: function() {
    return {
        todos: [],
        tags: [],
        newTodo: {id:null, title:"", tagID: 0, done: 0},
        selectedTodo: null,
        timerStatus: 3,
        timerTodo: null,
        timerTodoInited: false,
        // tag是否被选择
        tagChecked: false,
        setTag: 0,
    };
  },
  computed: {
      gotTodos() {
          return Boolean(this.todos.length);
      },
      tagTodo() {
         // 如果newTodo不存在title内容
        if(!this.todoValidate(this.newTodo)) {
            // 如果timer不在运行状态
            if(this.timerStatus !== 1) {
                if(this.tagChecked){
                    return true;
                }
            }
        }else{
            return false;
        }
        console.log(this.newTodo);
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
      inputChange(val) {
        // this.newTodo
        // console.log(this.newTodo);
      },
      // 添加新todo操作
      addNewTodo(ev,callback) {
        var _this = this;
        // 验证数据合法性
        if(this.todoValidate(this.newTodo)){
            // 先进行post请求
            this.$http.put('/api/todos', {"newTodo": this.newTodo}).then((res) => {
                if(res.ok) {
                    // put后返回成功插入后的数据ID，将数据推入当前的todo数据数组
                    let todoID = res.body.id;
                    _this.newTodo.id = todoID;
                    _this.addTodoDOM(todoID,_this.newTodo);
                    console.log('新增todo成功');
                    console.log('todoID: '+todoID);

                    if(callback){
                        console.log(callback);
                        callback(todoID);
                    }

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
        console.log(newTodo);
        newTodoData.tagname = this.getNameByTagID(newTodo.tagID);
        newTodoData.id = todoID;
        this.todos.unshift(newTodoData);
        console.log('unshift done');
        console.log(this.todos);
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
          // * 每次reset，必须要将todoTag设置为false，不然会触发timer进行todoTag的操作
          this.newTodo = {id: null, title: "",tagID: 0, done: 0, tagTodo: false};
      },
      selectTodoHandler(arg) {
        let todo = arg.todo;
        this.selectedTodo = todo;
		// 如果timer的不为状态为1，则代表没有todo正在计时，可以更改timer的todo
        if(this.timerStatus !== 1) {
            // 更换timerTodo
			this.timerTodo = todo;
        }
      },
        timerStatusChange(status) {
            this.timerStatus = status;
            console.log('main.timerstatus: '+this.timerStatus);
        },
        // 点击切换tag按钮触发
        radioChange(tag) {
            // 设置tagChecked，如不为0（默认，其他），则为true
            if(tag.id !== 0) {
                this.tagChecked = true;
                // 如果newTodo不存在title内容
                if(!this.todoValidate(this.newTodo)) {
                    // 如果timer不在运行状态
                    if(this.timerStatus !== 1) {
                        // alert();
                        // 标记为使用tag的todo状态
                        this.tagTodo = true;
                        // 修改timerTodo
                        this.timerTodo = {
                            title: tag.name,
                            tagID: tag.id,
                            tagTodo: true
                        };
                        console.log("xxxxxxxxxxxxxxx");
                        console.log(this.timerTodo);
                    }
                }
            }else {
                this.tagChecked = false;
            }
        },
        // 开启tag todo
        startTagTodo(tagTodo) {
            console.log('start TagTodo');
            console.log(tagTodo);
            // 设置为newTodo
            this.newTodo = tagTodo;
            // 添加newTodo
            this.addNewTodo(null, () => {
                // 通知timer，开启这个todo的计时
                bus.$emit('permitStartTagTodo');
            });
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
        padding: 0.5rem;
        background: #fff;
    }

    .new-todo-wrapper {
        // border: 1px solid #ddd;
        box-shadow: $boxShadow;
        padding: 0.5rem;
        line-height: 3rem;

        .new-btn-col {
            text-align: center;
        }
    }
    .todos-ctrl-wrapper {

        .todo-list-wrapper {
            margin: 1rem 0;
            height: 21rem;
            padding: 0.5rem;
            // border: 1px solid #ddd;
            box-shadow: $boxShadow;
            overflow: auto;
            // background: yellow;

            .todo-list-content {
                // min-height: 22rem;
            }
        }

        .control-wrapper {
            margin: 1rem 0;
            height: 21rem;
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
        padding: 0.5rem;
    }
</style>