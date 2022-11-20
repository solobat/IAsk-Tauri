
export const STATUS_OPTIONS = [
  { label: '未解决', value: 0, name: 'unresolved' },
  { label: '已解决', value: 1, name: 'resolved' },
  { label: '稍后解决', value: 2, name: 'todo' },
  { label: '近期关注', value: 3, name: 'marked' },
  { label: '一生的问题', value: 4, name: 'lifetime'},
  { label: '忽略', value: 9, name: 'notresolve'}
]

export const SYNC_INTERVAL_OPTIONS = [
  { label: '10秒', value: 10 * 1000 },
  { label: '半分钟', value: 30 * 1000 },
  { label: '1分钟', value: 60 * 1000 },
  { label: '5分钟', value: 5 * 60 * 1000 },
  { label: '半小时', value: 30 * 60 * 1000 },
]

export const SYNC_STATUS = {
  WAIT: 'wait',
  BEGIN: 'begin',
  SUCCESS: 'success',
  FAIL: 'fail'
}

export const WEBDAV_MIN_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[0].value;