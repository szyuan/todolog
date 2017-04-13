<template>
<div class="timer">
    <i-circle
        :size="250"
        :trail-width="4"
        :stroke-width="5"
        :percent="70"
        stroke-linecap="square"
        stroke-color="#43a3fb">
        <div class="timer-circle">
            <div class="title">
                <h2>做运营系统Feature做运营系统Feature做运营系统Feature做运营系统Feature</h2>
            </div>
            <h1>31:48</h1>
            <!--Button type="primary" shape="circle" size="large">开始</Button-->
            <div class="icon-wrapper">
                <Icon class type="ios-play-outline" size="60"></Icon>
            </div>
        </div>
    </i-circle>
</div>
</template>

<script>
export default {
    props: {
        // todo: {
        //     type: Object,
        //     default: {}
        // }
    },
    data() {
        return {
        }
    },
    methods: {
    },
    created() {
        console.log('x');
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
}
.timer-circle {
    h1 {
        font-size: 4rem;
        font-weight: 300;
        margin: 0.6rem auto;
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