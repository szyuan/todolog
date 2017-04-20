<template>
<div class="timer">
    <div class="circle-wrapper" :class="statusClass[timerStatus]">
        <i-circle
            :size="250"
            :trail-width="4"
            :stroke-width="5"
            :percent="70"
            stroke-linecap="square"
            stroke-color="#43a3fb">
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
        <Button class="done-btn" @click="doneTodo" :disabled="doneDisable" shape="circle" icon="android-done"></Button>
    </div>
</div>
</template>

<script>
import bus from '../../common/event-bus';
import moment from 'moment';

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
        }
    },
    computed: {
        timerTodo() {
            let timerTodo = {
                status: 3,
                title: '-',
                elapsedMS: 0,
                access: false,
                paused: false
            };
            // 如果有传入Todos，则覆盖默认值
            if(!(this.todo === null)) {
                this.timerStatus = this.todo.status;
                // this.changeTimerStatus(parseInt(this.todo.status));
                timerTodo.id = this.todo.id;
                timerTodo.title = this.todo.title;
                timerTodo.elapsedMS = this.todo.elapsed_ms;
                timerTodo.startTime = this.todo.start_time;
                timerTodo.access = true;
            }
            return timerTodo;
        },
        iconType() {
            if(this.timerStatus === 1) {
                return 'ios-pause-outline'
            }
            return 'ios-play-outline';
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
            // setClockStr(elapsedMS) {
            //     let elapsedMoment = moment.duration(elapsedMS);
            //     this.secondsStr = this.towDigit(elapsedMoment.seconds());
            //     this.minutesStr = this.towDigit(elapsedMoment.minutes());
            //     this.hoursStr = this.towDigit(elapsedMoment.hours());
            // },
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
        doneTodo(){},
        toggleStatus() {
            if(this.timerTodo.access) {
                if(this.timerStatus === 1) {
                    this.pauseTodo();
                    console.log(1);
                }else {
                    this.startTodo();
                    console.log(2);
                }
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
                if(!callbacked) {
                    callback&&callback();
                    callbacked = true;
                }
            }, 200);
        },
        // todo开启计时（数据库操作）
        startTodo() {
            let _this = this;
            let data = {
                userID: 1,
                todoID: this.timerTodo.id
            };
            this.$http.post('/api/todos/start',data).then((res) => {
                if(res.ok) {
                    console.log(this.timerStatus);
                    this.startClock(()=>{
                        // 开始计时后，再修改status
                        _this.changeTimerStatus(1);
                    });
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
            this.$emit('statusChange', status);
            console.log('timer.status:'+this.timerStatus);
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
            font-size: 1rem;
            font-weight: 400;
            height: 1rem;
            overflow: hidden;
            width: 11rem;
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
        }
        
        @at-root .circle-wrapper.ticking {

        }
    }
}
.timer-circle {
    .clock {
        font-size: 0px;
        font-weight: 300;
        margin: 0.6rem auto;
        span {
            font-size: 4rem;
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
    }
    .icon-wrapper {
        margin-bottom: -2rem;
    }
}
</style>