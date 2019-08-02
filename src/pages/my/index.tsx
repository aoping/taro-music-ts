import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtButton, AtList, AtListItem, AtFloatLayout, AtAvatar,AtTag, AtAccordion } from 'taro-ui'
import { connect } from '@tarojs/redux'
import { getUserDetailDao } from '@/services'
import { getPlayListDao } from './service'
import { showToDoToast } from '@/utils'


import './index.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  my: {
    recentPlay: []
  }
}

type PageDispatchProps = {
  asyncGetRecentPlayAction: (payload) => void
}

type PageOwnProps = {}

type PageState = {
  isCreateOpen: boolean
  isFavOpen: boolean
  userInfo: UserInfo
  userCreateList: Array<ListItemInfo>,
  userCollectList: Array<ListItemInfo>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ my }) => ({
  my
}), (dispatch) => ({
  asyncGetRecentPlayAction (payload) {
    dispatch({
      type: 'my/asyncGetRecentPlayAction',
      payload
    })
  },
}))
class Index extends Component<IProps, PageState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
  */
  config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor(props) {
    super(props)
    this.state = {
      isCreateOpen: true,
      isFavOpen: true,
      userInfo: Taro.getStorageSync('userInfo'),
      userCreateList: [],
      userCollectList: []
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    if (!this.state.userInfo) return
    this.getPlayList()
    this.asyncGetRecentPlay()
  }

  getPlayList() {
    const { id } = this.state.userInfo.account
    getPlayListDao(id).then((res) => {
      if (res.playlist && res.playlist.length > 0) {
        this.setState({
          userCreateList: res.playlist.filter(item => item.userId === id),
          userCollectList: res.playlist.filter(item => item.userId !== id),
        })
      }
    })
  }

  asyncGetRecentPlay() {
    const { id } = this.state.userInfo.account
    this.props.asyncGetRecentPlayAction({ uid: id })
  }

  componentDidHide () { }

  handleCreateOpenClick() {
    this.setState({
      isCreateOpen: !this.state.isCreateOpen,
    })
  }

  handleisFavOpClick() {
    this.setState({
      isFavOpen: !this.state.isFavOpen,
    })
  }
  render () {
    const { userCreateList, userCollectList, } = this.state
    const { recentPlay, } = this.props.my
    return (
      <View >
        <View className='wrapper'>
          <AtList hasBorder={false}>
            <AtListItem
              title='本地音乐'
              extraText='0'
              arrow='right'
              iconInfo={{value: 'icon iconfont icon-yinle', size: 22, color: '#d43c33'}}
              onClick={showToDoToast}
            />
            <AtListItem
              title='最近播放'
              arrow='right'
              extraText={String(recentPlay.length)}
              iconInfo={{value: 'icon iconfont icon-bofang', size: 22, color: '#d43c33'}}
            />
            <AtListItem
              title='我的电台'
              arrow='right'
              iconInfo={{value: 'icon iconfont icon-CN_doubanFM', size: 22, color: '#d43c33'}}
            />
            <AtListItem
              title='我的收藏'
              arrow='right'
              iconInfo={{value: 'icon iconfont icon-wodeshoucang', size: 22, color: '#d43c33'}}
            />
          </AtList>

          <AtAccordion
            open={this.state.isCreateOpen}
            onClick={this.handleCreateOpenClick.bind(this)}
            title='我创建的歌单'
            icon={{ value: 'heart', color: '#d43c33', size: '15' }}
          >
            <AtList hasBorder={false}>
            {
              userCreateList.map((item, index) => {
                let note = item.trackCount + '首, 播放' + (item.playCount < 10000 ? item.playCount : `${(item.playCount/10000).toFixed(1)}万`)+'次'
                return (
                  <AtListItem
                    key={item.name+index}
                    title={item.name}
                    note={note}
                    arrow='right'
                    thumb={item.coverImgUrl}
                  />
                )
              })
            }
            </AtList>
          </AtAccordion>
          <AtAccordion
            open={this.state.isFavOpen}
            onClick={this.handleisFavOpClick.bind(this)}
            title='我收藏的歌单'
            icon={{ value: 'star', color: '#d43c33', size: '15' }}
          >
            <AtList hasBorder={false}>
            {
              userCollectList.map((item, index) => {
                let note = item.trackCount + '首, 播放' + (item.playCount < 10000 ? item.playCount : `${(item.playCount/10000).toFixed(1)}万`)+'次'
                return (
                  <AtListItem
                    key={item.name+index}
                    title={item.name}
                    note={note}
                    arrow='right'
                    thumb={item.coverImgUrl}
                  />
                )
              })
            }
            </AtList>
          </AtAccordion>
        </View>

      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index
