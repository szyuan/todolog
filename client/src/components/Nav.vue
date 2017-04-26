<template>
    <div>
        <Menu mode="horizontal" :theme="theme1" active-name="1">
            <Menu-item name="1">
                <Icon type="ios-paper"></Icon>
                首页
            </Menu-item>
            <Menu-item name="2">
                <Icon type="ios-people"></Icon>
                完成记录
            </Menu-item>
            <Menu-item name="4">
                <Icon type="settings"></Icon>
                数据统计
            </Menu-item>
        </Menu>
    </div>
</template>
<script>
    // theme:light,dark,primary
    export default {
        data () {
            return {
                theme1: 'primary'
            }
        }
    }
</script>