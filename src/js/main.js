class TimeZone {
  constructor(lang, config = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    // second: 'numeric',
    hour12: false
  }) {
    this.lang = lang || 'en'; // 語言
    this.supportingLang = ['en', 'zh-TW', 'ja-JP-u-ca-japanese', 'ko-KR'];
    this.getTimeConfig = config, // 預設的 toLocaleString() API參數
    this.supportingZone = this.getLocalStorage('userSelectedData', 'supportingZoneData')[1] || ['Europe/London', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york', 'Pacific/Chatham']; // 預設支援的地區
    this.userSelectZone = this.getLocalStorage('userSelectedData', 'supportingZoneData')[0] || ['Asia/Taipei']; // 使用者選取的所有地區，預設為台北時間
    this.configAddingUserSelectZone = []; // 將使用者選取的地區資料與this.getTimeConfig合併
    this.timeStringData = []; // 預備渲染到畫面的資料
    this.doms = {
      zoneSelector: document.querySelector('#zoneSelector'),
      lanSelector: document.querySelector('#langSelector'),
    }

/////////////

    this.init();
    this.renderLangSelector()
    this.renderZoneSelectors();
    this.createTimeZoneView();
    this.setEventListener();
    let self = this;
    setInterval(function(){
      self.init();
      self.createTimeZoneView();
    }, 60000); 
  }

/////////////
// methods //
/////////////

  // 渲染支援地區
  renderZoneSelectors() {

    // 支援地區
    while(this.doms.zoneSelector.hasChildNodes()) {
      this.doms.zoneSelector.removeChild(this.doms.zoneSelector.firstChild);
    }
    
    this.supportingZone.forEach((item) => {
      const option = document.createElement('option');
      option.setAttribute('value', item);
      // option.setAttribute('data-zone', item);
      option.dataset.zone = item;
      option.innerText = item.replace(/\w+\/(\w+)/, '$1').replace(/\_/g, ` `);
      this.doms.zoneSelector.appendChild(option);
    })
    const head = document.createElement('option');
    head.setAttribute('value', `head`);
    head.innerText = `-------`
    this.doms.zoneSelector.prepend(head);
  }
  renderLangSelector() {
    // 支援語言
    this.supportingLang.forEach((item) => {
      const option = document.createElement('option');
      option.setAttribute('value', item);
      if(item === 'en') {
        item = 'English';
      } else if (item === 'zh-TW') {
        item = '繁體中文';
      } else if (item === 'ja-JP-u-ca-japanese') {
        item = '日本語';
      } else if (item === 'ko-KR') {
        item = '한국어';
      }
      
      option.innerText = item;
      this.doms.lanSelector.appendChild(option);
    })
  }
  // 非動態事件監聽
  setEventListener() {
    let self = this;

    // 語言選擇事件監聽;
    this.doms.lanSelector.addEventListener('change', function(e){
      if (console) console.log("Current Language: " + e.target.value);
      self.lang = e.target.value;
      self.createTimeZoneView();
    }, false);

    // 選擇地區事件監聽
    this.doms.zoneSelector.addEventListener('change', function(e){
      
      if(e.target.value == 'head') return;

      // 處理下拉選單資料 & 和使用者選擇地區資料
      self.supportingZone = self.supportingZone.filter((item) => {
        return item !== e.target.value;
      })
      if(self.userSelectZone.indexOf(e.target.value) == -1) {
        self.userSelectZone.push(e.target.value);
      }

      self.setLocalStorage(self.userSelectZone, self.supportingZone);
      self.init();
      self.createTimeZoneView();
      self.renderZoneSelectors();
    }, false);
    
  }
  // 初始化
  init() {
    // 將this.zone地區資料推送進this.getTimeConfig合併，並將新資料指向至this.configAddingUserSelectZone
    this.configAddingUserSelectZone = [];
    this.userSelectZone.forEach((item) => {
      let cloneConfig = Object.assign({}, this.getTimeConfig);
      cloneConfig.timeZone = item;
      this.configAddingUserSelectZone.push(cloneConfig);
    })
  }
  // 時區資料和doms渲染
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
            ${(this.userSelectZone[index].replace(/\w+\/(\w+)/, '$1')).replace(/\_/g, ` `).toUpperCase()}
          </div>
          <div class="information__date">
            ${newItem[0]}${newItem[1]}
          </div>
        </div>
        <div class="time">
          ${newItem[2]}
        </div>
        <div class="delete" data-zone="${this.userSelectZone[index]}"></div>
        `
      } else if(this.lang == 'ko-KR') {
        let newItem = item.split(' ');

        // 翻譯地名
        const KR = this.userSelectZone.map((item) => {
          switch(item) {
            case 'Asia/Taipei':
              return '타이페이';
              break;
            case 'Europe/London':
              return '런던';
              break;
            case 'Australia/Sydney':
              return '시드니';
              break;
            case 'Asia/Bangkok':
              return '방콕';
              break;
            case 'America/New_york':
              return '뉴욕';
              break;
            case 'Pacific/Chatham':
              return '채텀';
              break;
          }
        })

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${KR[index]}
          </div>
          <div class="information__date">
            ${newItem[0]}${newItem[1]}${newItem[2]}
          </div>
        </div>
        <div class="time">
          ${newItem[3]}
        </div>
        <div class="delete" data-zone="${this.userSelectZone[index]}"></div>
        `
      } else if(this.lang == 'zh-TW') {
        let newItem = item.split(' ');

                // 翻譯地名
        const KR = this.userSelectZone.map((item) => {
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
            ${KR[index]}
          </div>
          <div class="information__date">
            ${newItem[0]}
          </div>
        </div>
        <div class="time">
          ${newItem[1]}
        </div>
        <div class="delete" data-zone="${this.userSelectZone[index]}"></div>
        `
      } else if (this.lang == 'ja-JP-u-ca-japanese') {
        let newItem = item.split(' ');

        // 翻譯地名
        const JP = this.userSelectZone.map((item) => {
          switch(item) {
            case 'Asia/Taipei':
              return '台北';
              break;
            case 'Europe/London':
              return 'ロンドン';
              break;
            case 'Australia/Sydney':
              return 'シドニー';
              break;
            case 'Asia/Bangkok':
              return 'バンコク';
              break;
            case 'America/New_york':
              return 'ニューヨーク';
              break;
            case 'Pacific/Chatham':
              return 'チャタム';
              break;
          }
        })

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${JP[index]}
          </div>
          <div class="information__date">
            ${newItem[0]}
          </div>
        </div>
        <div class="time">
          ${newItem[1]}
        </div>
        <div class="delete" data-zone="${this.userSelectZone[index]}"></div>
        `        
      }
      wrapNode.appendChild(timeZoneParentNode);
      this.deleteBtnListener();
    })
  }
  // 刪除時區事件監聽
  deleteBtnListener() {
    const deleteBtn = document.querySelectorAll('.delete');
    const self = this;
    
    deleteBtn.forEach((item) => {
      item.addEventListener('click', function(e){
        // 只剩一筆資料時禁止刪除
        if(self.userSelectZone.length === 1) return;

        // 處理下拉選單資料 & 和使用者選擇地區資料
        self.userSelectZone = self.userSelectZone.filter((item) => {
          return item !== e.target.dataset.zone
        })
        if(self.supportingZone.indexOf(e.target.dataset.zone)== -1) {
          self.supportingZone.push(e.target.dataset.zone);
        }

        self.setLocalStorage(self.userSelectZone, self.supportingZone);
        self.init();
        self.createTimeZoneView();
        self.renderZoneSelectors();
      }, false);
    })
  }
  setLocalStorage(userSelectZone, supportingZone) {
    const userSelectZoneData = JSON.stringify(userSelectZone);
    const supportingZoneData = JSON.stringify(supportingZone);
    localStorage.setItem('userSelectedData', userSelectZoneData);
    localStorage.setItem('supportingZoneData', supportingZoneData);
  }
  getLocalStorage(LStitle1, LStitle2) {
    const userSelectZoneData = JSON.parse(localStorage.getItem(LStitle1));
    const supportingZoneData = JSON.parse(localStorage.getItem(LStitle2));
    return [userSelectZoneData, supportingZoneData];
  }
}

const TZ = new TimeZone();
