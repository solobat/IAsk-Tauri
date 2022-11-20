import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import { AnswerModel } from '../server/model/Answer'

const CONT_TIME_INTERVAL = 5 * 60 * 60 * 1000
const SHORT_TIME_INTERVAL = 7 * 24 * 60 * 60 * 1000

function setup() {
  const lang = 'zh-cn'

  if (lang.startsWith('zh')) {
    dayjs.locale('zh-cn')
  } else {
    dayjs.locale('en')
  }
}

setup()

export function msgTimeFormatter(curTime: number, lastValidTime = 0) {
  const contDiff = curTime - lastValidTime
  const now = Number(new Date())

  if (contDiff > CONT_TIME_INTERVAL) {
    const nowDiff = now - curTime

    if (nowDiff > SHORT_TIME_INTERVAL) {
      return dayjs(curTime).format('YYYY-MM-DD HH:mm')
    } else {
      const cur = dayjs(curTime)
      const today = dayjs().hour(0)
      const yestoday = today.subtract(1, 'day')
      const d2ago = today.subtract(2, 'day')

      if (cur.isAfter(today)) {
        return cur.format('HH:mm')
      } else if (cur.isAfter(yestoday)) {
        return `昨天 ${cur.format('HH:mm')}`
      } else if (cur.isAfter(d2ago)) {
        return `前天 ${cur.format('HH:mm')}`
      } else {
        return cur.format('dddd HH:mm')
      }
    }
  } else {
    return ''
  }
}

let lastValidTime = 0

export function getMsgTime(item: AnswerModel, index: number) {
  if (index === 0) {
    lastValidTime = 0
  }
  const curTime = item.createTime ?? Date.now()
  const time = msgTimeFormatter(curTime, lastValidTime)

  if (time) {
    lastValidTime = curTime
  }

  return time
}

export function getInterval(time: number) {
  const diff = Number(new Date) - time;
  const weeklyInterval = 7 * 24 * 60 * 60 * 1000;
  const monthlyInterval = 30 * 24 * 60 * 60 * 1000;
  const quarterlyInterval = 100 * 24 * 60 * 60 * 1000;

  if (diff <= weeklyInterval) {
    return 'weekly'
  } else if (weeklyInterval < diff && diff <= monthlyInterval) {
    return 'monthly'
  } else if (monthlyInterval < diff && diff <= quarterlyInterval) {
    return 'quarterly'
  } else {
    return 'more'
  }
}