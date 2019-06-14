import $ from 'jquery';
// var a = new Date().toLocaleString('en', {timeZone: 'Asia/Taipei',day: '2-digit',month: 'short',year: 'numeric', hour: 'numeric',  minute: 'numeric',  second: 'numeric',hour12: false});

// let zone = ['Europe/London', 'Asia/Taipei', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york'];
// let lang = ['en', 'zh-TW'];
// let getTimeConfig = {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     hour12: false
// };

// this.zone = ['Europe/London', 'Asia/Taipei', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york'];
// this.lang = ['en', 'zh-TW'];
// this.getTimeConfig = {
//   day: '2-digit',
//   month: 'short',
//   year: 'numeric',
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
//   hour12: false
// };


class TimeZone {
  constructor(lang, area, config = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    // second: 'numeric',
    hour12: false  
  }) {
    this.lang = lang || 'en';
    this.zone = area || ['Asia/Taipei','Europe/London', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york'];
    this.getTimeConfig = {
      day: config.day,
      month: config.month,
      year: config.year,
      hour: config.hour,
      minute: config.minute,
      // second: config.second,
      hour12: config.hour12,
    };
    this.cache = []; // 暫存預備丟入toLocaleString() API的物件
    this.timeZoneStringData = []; // 預備渲染到畫面的資料

    // 將this.zone地區資料推送進this.getTimeConfig中，並將新資料推送至this.cache
    this.zone.forEach((item) => {
      let cloneConfig = Object.assign({}, this.getTimeConfig);
      cloneConfig.timeZone = item;
      this.cache.push(cloneConfig);
    })

    // 第一次渲染畫面
    this.createTimeZoneView();
    
    // 每分鐘更新畫面
    const self = this;
    setInterval(function(){
      self.createTimeZoneView();
    }, 60000)

    console.log(this.cache);
    console.log(this.timeZoneStringData);
  }

  // 渲染畫面方法
  createTimeZoneView() {
    const wrapNode = document.querySelector('.content');

    // 每次更新移除子節點重新渲染
    while(wrapNode.hasChildNodes()) {
      wrapNode.removeChild(wrapNode.firstChild);
    }

    // 將toLocaleString() API產生的字串丟入this.timeZoneStringData陣列中
    this.timeZoneStringData = this.cache.map((item) => {
      return new Date().toLocaleString(this.lang, item);
    })

    // 將資料塞入子節點，渲染畫面
    this.timeZoneStringData.forEach((item, index) => {
      let newItem = item.split(',');
      console.log(newItem);
      const timeZoneParentNode = document.createElement('div');
      timeZoneParentNode.classList.add('content__item');
      timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${(this.zone[index].replace(/\w+\/(\w+)/, '$1')).toUpperCase()}
          </div>
          <div class="information__date">
            ${newItem[0]}${newItem[1]}
          </div>
        </div>
        <div class="time">
        ${newItem[2]}
        </div>
      `
      wrapNode.appendChild(timeZoneParentNode);
    })
  }
}

const TZ = new TimeZone();
