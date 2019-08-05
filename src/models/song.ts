import modelExtend from 'dva-model-extend'
import { model } from './uitls'
import { getSongDetailDao, getSongUrlDao, getLyricDao, getLikelistDao } from '@/services'
import {parse_lrc} from '@/utils'

export default modelExtend(model, {
  namespace: 'song',
  state: {
    canPlayList: [],
    currentSongId: '',
    currentSongInfo: {
      id: 0,
      name: '',
      ar: [],
      al: {
        picUrl: '',
        name: ''
      },
      url: '',
      lrcInfo: '',
      dt: 0, // 总时长，ms
      st: 0 // 是否喜欢
    },
    currentSongIndex: 0,
    playMode: 'loop',
    likeMusicList: [],
    isPlaying: false,
    recentTab: 0
  },
  effects: {
    *getSongInfoAction({ payload }, { call, put }) {
      const { id } = payload
      let [songDetail, songUrl, lyric, ] = yield [call(getSongDetailDao, id), call(getSongUrlDao, id), call(getLyricDao, id), ]
      const lrc = parse_lrc(lyric.lrc && lyric.lrc.lyric ? lyric.lrc.lyric : '');

      let songInfo = {
        ...songDetail.songs[0],
        ...{url: songUrl.data[0].url, lrcInfo: { lrclist: lrc.now_lrc, scroll: lrc.scroll ? 1 : 0 }}
      }
      yield put({ type: 'updateState', payload: { currentSongInfo: songInfo }})
    },
    *getLikelistAction({ payload }, { call, put }) {
      const { id } = payload
      let res = yield call(getLikelistDao, id)
      yield put({ type: 'updateState', payload: { likeMusicList: res.ids }})
    }
  },
  reducers: {

  }
})
