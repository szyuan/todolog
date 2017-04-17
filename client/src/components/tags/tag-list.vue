<template>
<div class="tag-list" >
    <Radio-group v-model="newTodo.tagID" size="large" type="button" class="tag-radio-group">
        <Row class="tag-radio-row">
            <Col span="8" v-for="tag in tags" :key="tag.key" class="tag-radio-col">
                <div class="tag-radio">
                    <Radio :label="tag.id" :key="tag.id">{{tag.name}}</Radio>
                </div>
            </Col>
        </Row>
    </Radio-group>
</div>
</template>

<script>
export default {
    props: {
        tags: {
            type: Array,
            default: []
        },
        newTodo: {
            type: Object,
            default: {}
        }
    },
    computed: {
    },
    data() {
        return {
            
        }
    },
    methods: {

    }
}
</script>

<style lang="scss">
.tag-list {

    height: 5.6rem;
    // overflow: auto;
    overflow: auto;
    // background: yellow;

    .tag-radio-group {
        display: block;
        // 最后三位清除margin
        .tag-radio-col:nth-last-child(1) .tag-radio,
        .tag-radio-col:nth-last-child(2) .tag-radio,
        .tag-radio-col:nth-last-child(3) .tag-radio{
            margin-bottom: 0;
        }
    }
    .tag-radio-row {
        display: flex;
        flex-wrap: wrap;
    }
    .tag-radio {
        text-align: center;
        margin-bottom: 1rem;
    }
}
</style>