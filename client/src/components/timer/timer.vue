<template>
<div class="timer">
    <div class="circle-wrapper" :class="statusClass[timerStatus]">
        <i-circle
            :size="250"
            :trail-width="2"
            :stroke-width="2"
            :percent="circlePercent"
            stroke-linecap="round"
            stroke-color="#ff9292"
            trail-color="rgb(250, 233, 231)">
            <div class="timer-circle">
                <div class="title">
                    <h2>{{timerTodo.title}}</h2>
                </div>
                <h1 class="clock">
                    <span class="hours" v-show="hours > 0">{{hoursStr}}:</span>
                    <span class="minutes">{{minutesStr}}:</span>
                    <span class="seconds">{{secondsStr}}</span>
                </h1>
                <!--Button type="primary" shape="circle" size="large">开始</Button-->
                <div class="icon-wrapper" @click="toggleStatus">
                    <Icon :type="iconType" size="60"></Icon>
                </div>
            </div>
        </i-circle>
        <Button v-show="timerTodo.access" class="done-btn" @click="doneTodo" :disabled="doneDisable" shape="circle" icon="android-done"></Button>
    </div>
</div>
</template>

<script>
import bus from '../../common/event-bus';
import moment from 'moment';

// const 

export default {
    props: {
        todo: Object,
    },
    data() {
        return {
            doneDisable: false,
            // 3:无数据 0:停止 1:运行 2:暂停
            statusClass: [ 'stop', 'ticking', 'pause', 'no-data'],
            timerStatus: 3,
            timeInterval: null,
            initTicking: false,

            secondsStr: "00",
            minutesStr: "00",
            hoursStr: "00",
            seconds: 0,
            minutes: 0,
            hours: 0,
            clockMS: 0,
            // 一圈的时间：25分钟 = 1500000毫秒
            circleSumMS: 1500000,
            fullCircleNum: 0,
            originTitle: window.document.title           
        }
    },
    computed: {
        timerTodo() {
            let timerTodo = {
                status: 3,
                title: '-',
                tagID: 0,
                elapsedMS: 0,
                access: false,
                paused: false,
                done: 0
            };
            // 如果有传入Todos，则覆盖默认值
            if(!(this.todo === null)) {
                if(this.todo.done !== 1) {
                    this.timerStatus = this.todo.status;
                    // this.changeTimerStatus(parseInt(this.todo.status));
                    timerTodo.id = this.todo.id;
                    timerTodo.title = this.todo.title;
                    timerTodo.tagID = this.todo.tagID;
                    timerTodo.elapsedMS = this.todo.elapsed_ms||0;
                    timerTodo.startTime = this.todo.start_time;
                    timerTodo.access = true;
                    timerTodo.tagTodo = this.todo.tagTodo;
                    
                    this.clockMS = timerTodo.elapsedMS;
                }else {
                    this.resetTimer();
                }
            }
            console.log('computed timer');
            return timerTodo;
        },
        iconType() {
            if(this.timerStatus === 1) {
                return 'ios-pause-outline'
            }
            return 'ios-play-outline';
        },
        circlePercent() {
            let timerTodo = this.timerTodo;
            let access = timerTodo.access;
            let per = 0;
            if(access) {
                let elapsedMS = this.clockMS;
                let fullCircleNum = 0;
                let num = elapsedMS / this.circleSumMS;
                fullCircleNum = Math.floor(num);
                this.fullCircleNum = fullCircleNum;
                let temp = (num - fullCircleNum) * 100;
                per = (temp).toFixed(1);
                if(per > 0 && temp < 0.1){
                    per = 0.1;
                }
            }
            return parseFloat(per);
        }
    },
    watch: {
        // 监听status变化，判断是否进行计时
        timerStatus: function(val) {
            // 只运行一次
            if(!this.initTicking){
                if(val === 1) {
                    console.log('start clock');
                    this.startClock();
                }
                this.initTicking = true;
            }
        },
        // todo变化，修改clock数据
        todo() {
            this.setClockStr(this.getElapsedTime(true));
        }
    },
    created() {
        // 设置数据
        if(this.todo.title) {
            return this.todo;
        }
    },
    methods: {
        // 在timer里完成todo
        doneTodo(){
            if(this.timerTodo.access) {
                let data = {
                    userID: 1,
                    todoID: this.timerTodo.id
                };
                this.$http.post('/api/todos/done',data).then((res) => {
                    if(res.ok) {
                        this.timerTodo.done = true;
                        this.todo.done = 1;
                        this.resetTimer();
                        this.timerTodo = null;
                        console.log(this.timerTodo);
                    }else {
                        alert("todo完成失败");
                    }
                });
            }
        },
        toggleStatus() {
            let _this = this;
            console.log(this.timerTodo);
            // 非tagTodo的普通情况
            if(!this.timerTodo.tagTodo) {
                // 需要确认access
                if(this.timerTodo.access) {
                    if(this.timerStatus === 1) {
                        this.pauseTodo();
                        console.log(1);
                    }else {
                        this.startTodo();
                        console.log(2);
                    }
                }
            // tagTodo的情况
            } else {
                console.log('toggle tagTodo');
                // 通知服务器新建一个Todo,并使用为当前且开始计时
                this.$emit('startTagTodo',this.timerTodo);
                // 收到Main创建成功，便开始运行当前timerTodo
                bus.$on('permitStartTagTodo', () => {
                    console.log('permitted, startTodo');
                    _this.startTodo();
                });
            }
        },
        getElapsedTime(justElapsed) {
            // 暂停后，当前这个todo的elapsedMS需要更新
            let elapsedMS = this.timerTodo.elapsedMS;
            let now = Date.now();

            // 如果开始这个todo是暂停状态，则将开始时间设置为现在
            if(this.timerTodo.paused){
                this.timerTodo.startTime = now;
                this.timerTodo.paused = false;
            }
            if(this.timerStatus!==1) {
                this.timerTodo.startTime = now;
            }

            let startTime = this.timerTodo.startTime;
            let startDate = (startTime===null) ? Date.now() : new Date(startTime);
            let ElapsedNowFromStart = (now - startDate);
            
            // 是否设置只计算elapsed，不考虑startTime
            if(justElapsed) {
                ElapsedNowFromStart = 0;
            }
            let elapsed = ElapsedNowFromStart + elapsedMS;
            // console.log(moment.duration(elapsed).seconds());
            // 返回一个moment对象
            return moment.duration(elapsed);
        },
        // 页面时钟开始计时（不影响数据库）
        startClock(callback) {
            clearInterval(this.timeInterval);
            let _this = this;
            let moment = null;
            let callbacked = false;
            // 每秒更新timeStr
            this.timeInterval = setInterval(() => {
                moment = _this.getElapsedTime();
                this.seconds = moment.seconds();
                this.minutes = moment.minutes();
                this.hours = moment.hours();
                this.secondsStr = this.towDigit(moment.seconds());
                this.minutesStr = this.towDigit(moment.minutes());
                this.hoursStr = this.towDigit(moment.hours());
                this.clockMS = moment.asMilliseconds();
                if(!callbacked) {
                    callback&&callback();
                    callbacked = true;
                }
                // 设置文档document
                this.setDocumentTitle(this.hoursStr,this.minutesStr,this.secondsStr,this.timerTodo.title);
            }, 200);
        },
        // todo开启计时（数据库操作）
        startTodo() {
            let _this = this;
            let data = {
                userID: 1,
                todoID: this.timerTodo.id
            };
            console.log(data);
            this.$http.post('/api/todos/start',data).then((res) => {
                if(res.ok) {
                    console.log(this.timerStatus);
                    this.startClock(()=>{
                        // 开始计时后，再修改status
                        _this.changeTimerStatus(1);
                    });
                    this.timerTodo.tagTodo = false;
                    // 通过watch调用this.startClock
                    // this.timerStatus = 1;
                }else {
                    alert("开启失败");
                }
            });
        },
        // todo停止计时（数据库操作)
        pauseTodo() {
            let data = {
                userID: 1,
                todoID: this.timerTodo.id
            };
            this.$http.post('/api/todos/pause',data).then((res) => {
                if(res.ok) {
                    clearInterval(this.timeInterval);
                    // this.timerStatus = 2;
                    this.changeTimerStatus(2);
                    // 重写startTime
                    this.timerTodo.startTime = Date.now();
                    // 暂停后，当前这个todo的elapsedMS需要更新
                    this.timerTodo.elapsedMS = res.body.elapsed_ms;
                    this.todo.elapsed_ms = res.body.elapsed_ms;
                    // 标记这个todo被暂停过
                    this.timerTodo.paused = true;
                    // 将暂停后的结果elapsedMS设置到Clock上
                    this.setClockStr(this.timerTodo.elapsedMS);
                    console.log('end: '+res.body.elapsed_ms);
                }else {
                    alert("暂停失败");
                }
            });
        },
        towDigit(num) {
            let val = parseInt(num);
            val = (val<10) ? '0'+val : val;
            return val;
        },
        setClockStr(elapsedMS) {
            let elapsedMoment = moment.duration(elapsedMS);
            this.secondsStr = this.towDigit(elapsedMoment.seconds());
            this.minutesStr = this.towDigit(elapsedMoment.minutes());
            this.hoursStr = this.towDigit(elapsedMoment.hours());
        },
        changeTimerStatus(status) {
            status = parseInt(status);
            this.timerStatus = status;
            this.timerTodo.status = status;
            this.$emit('statusChange', status);
            console.log('timer.status:'+this.timerStatus);
        },
        resetTimer() {
            this.setClockStr(0);
        },
        setDocumentTitle(h, m, s, title) {
            // 设置title
            let hoursStr = (parseInt(h)>1) ? h+':' : '';
            if(document.hidden) {
                window.document.title = hoursStr+m+':'+s+'-'+title+'-'+this.originTitle;
            } else {
                if(!(window.document.title == this.originTitle))
                    window.document.title = this.originTitle;
            }
        }
    },
    created() {
        console.log(this.todo);
    }
}
</script>

<style lang="scss">
.timer {
    .title {
        h2 {
            font-size: 18px;
            font-weight: 400;
            height: 18px;
            overflow: hidden;
            width: 200px;
            margin: 0rem auto 0 auto;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .circle-wrapper {
        position: relative;
        max-width: 260px;
        // background: yellow;
        margin: 0 auto;

        .done-btn {
            position: absolute;
            left: 0;
            top: 0;
            background: #fff;
            border-color: #bbb;
            color: #bbb;
            &:hover {
                border-color: #a5cba6;
                color: #a5cba6;
                background: #effff3;
            }
        }
        
        @at-root .circle-wrapper.ticking {

        }
    }
}
.timer-circle {
    color: #ffa6a0;
    .clock {
        font-size: 0px;
        font-weight: 300;
        margin: 0.6rem auto 0 auto;
        span {
            // font-size: 4rem;
            font-size: 64px;
        }
        .hours {
            font-size: 1.4rem;
            // font-weight: 400;
        }
    }
    h2 {
        font-size: 2rem;
        font-weight: 300;
        word-wrap: nowrap;
        color: #888;
    }
    .icon-wrapper {
        margin-bottom: -40px;
        font-size: 80px;
        height: 80px;
        line-height: 80px;
        transition: all .2s;

        i.ivu-icon {
            font-size: inherit !important;
            line-height: inherit !important;
        }

        &:hover {
            font-size: 90px;
            line-height: 60px;
        }
    }
}
</style>