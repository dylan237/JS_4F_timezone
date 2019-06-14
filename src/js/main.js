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
    this.lang = lang || 'en'; // 語言
    this.zone = area || ['Asia/Taipei','Europe/London', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york']; // 放在view上渲染的最終資料
    this.getTimeConfig = {
      day: config.day,
      month: config.month,
      year: config.year,
      hour: config.hour,
      minute: config.minute,
      // second: config.second,
      hour12: config.hour12,
    }; // 預設的 toLocaleString() API參數
    this.supportingZone = ['Asia/Taipei','Europe/London', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york', 'Pacific/Chatham']; // 預設支援的地區
    this.userSelectZone = []; // 使用者選取的所有地區
    this.configAddingUserSelectZone = []; // 將使用者選取的地區資料與this.getTimeConfig合併
    this.timeStringData = []; // 預備渲染到畫面的資料
    this.doms = {
      zoneSelector: document.querySelector('#zoneSelector'),
      lanSelector: document.querySelector('#langSelector'),
    }
    
    let self = this;

    this.init();
    this.renderZoneSelector();
    this.createTimeZoneView();
    this.setEventListener();
    setInterval(function(){
      self.init();
      self.createTimeZoneView();
    }, 1000)

  }
  // 渲染支援語言
  renderZoneSelector() {
    this.supportingZone.forEach((item) => {
      const option = document.createElement('option');
      option.setAttribute('value', item);
      option.innerText = item.replace(/\w+\/(\w+)/, '$1').replace(/\_/g, ` `);
      zoneSelector.appendChild(option);
    })    
  }
  // 事件監聽
  setEventListener() {
    let self = this;
    // 語言選擇事件監聽;
    this.doms.lanSelector.addEventListener('change', function(e){

      console.log("Current Language: " + e.target.value);
      self.lang = e.target.value;
      self.createTimeZoneView();

    }, false);
    // 選擇地區事件監聽
    this.doms.zoneSelector.addEventListener('change', function(e){
      // 排除重複
      if(self.userSelectZone.indexOf(e.target.value) == -1) {
        self.userSelectZone.push(e.target.value);
      }
      self.zone = [...self.userSelectZone];
      self.init();
      self.createTimeZoneView();
    }, false);
  }
  // 初始化
  init() {
    // 將this.zone地區資料推送進this.getTimeConfig合併，並將新資料指向至this.configAddingUserSelectZone
    this.configAddingUserSelectZone = [];
    this.zone.forEach((item) => {
      let cloneConfig = Object.assign({}, this.getTimeConfig);
      cloneConfig.timeZone = item;
      this.configAddingUserSelectZone.push(cloneConfig);
    })
  }
  // 渲染時區資料
    createTimeZoneView() {
    const wrapNode = document.querySelector('.content');

    // 每次更新移除子節點重新渲染
    while(wrapNode.hasChildNodes()) {
      wrapNode.removeChild(wrapNode.firstChild);
    }

    // 將toLocaleString() API產生的字串丟入this.timeStringData陣列中
    this.timeStringData = this.configAddingUserSelectZone.map((item) => {
      return new Date().toLocaleString(this.lang, item);
    })

    // 將資料塞入子節點，渲染畫面
    this.timeStringData.forEach((item, index) => {

      const timeZoneParentNode = document.createElement('div');
      timeZoneParentNode.classList.add('content__item');

      if (this.lang == 'en') {
        let newItem = item.split(',');

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${(this.zone[index].replace(/\w+\/(\w+)/, '$1')).replace(/\_/g, ` `).toUpperCase()}
          </div>
          <div class="information__date">
            ${newItem[0]}${newItem[1]}
          </div>
        </div>
        <div class="time">
          ${newItem[2]}
        </div>
        `
      } else {
        let newItem = item.split(' ');

        // 翻譯地名
        
        const zhTW = this.zone.map((item) => {
          switch(item) {
            case 'Asia/Taipei':
              return '台北';
              break;
            case 'Europe/London':
              return '倫敦';
              break;
            case 'Australia/Sydney':
              return '雪梨';
              break;
            case 'Asia/Bangkok':
              return '曼谷';
              break;
            case 'America/New_york':
              return '紐約';
              break;
            case 'Pacific/Chatham':
              return '查塔姆';
              break;
          }
        })

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${zhTW[index]}
          </div>
          <div class="information__date">
            ${newItem[0]}
          </div>
        </div>
        <div class="time">
          ${newItem[1]}
        </div>
        `
      }
      wrapNode.appendChild(timeZoneParentNode);
    })
  }

  // 語言設定
}

const TZ = new TimeZone();
