class TimeZone {
  constructor(lang, config = {
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    // second: 'numeric',
  }) {
    // 設定localStorage資料標題
    this.localStorage = {
      userSelectedTimezone: '_usz',
      supportedTimezone: '_spz',
      userLang: '_usl',
    },
    this.supportedLanguages = ['en', 'zh-TW', 'ja-JP-u-ca-japanese', 'ko-KR']; // #langSelector選單資料
    this.supportedTimezone = this.getLocalStorage(this.localStorage.supportedTimezone) || ['Europe/London', 'Australia/Sydney', 'Asia/Bangkok', 'America/New_york', 'Pacific/Chatham']; // #userSelectedTimezone選單資料
    this.userSelectedLang = this.getLocalStorage(this.localStorage.userLang) || lang || 'en'; // 使用者選擇語言
    this.userSelectedTimezone = this.getLocalStorage(this.localStorage.userSelectedTimezone) || ['Asia/Taipei']; // 使用者選取的所有地區，預設為台北時間
    this.toLocalStringConfig = config, // 預設的 toLocaleString() API參數
    this.dataCombine = []; // 將this.userSelectedTimezone與this.toLocalStringConfig合併
    this.timeStringData = []; // 由this.dataCombine透過toLocaleString() API所產生的資料陣列，為最後渲染到畫面的時間資料
    this.doms = {
      zoneSelector: document.querySelector('#zoneSelector'),
      langSelector: document.querySelector('#langSelector'),
    }

//-------------------------------------------

    this.init();
    this.renderLangSelector()
    this.renderZoneSelector();
    this.renderTimezone();
    this.setEventListener();
    let self = this;
    setInterval(function(){
      self.init();
      self.renderTimezone();
    }, 60000); 
  }

//-------------------------------------------
// methods 
//-------------------------------------------

  // 渲染支援地區
  renderZoneSelector() {
    while(this.doms.zoneSelector.hasChildNodes()) {
      this.doms.zoneSelector.removeChild(this.doms.zoneSelector.firstChild);
    }
    
    const self = this;
    this.supportedTimezone.forEach((item) => {
      const option = document.createElement('option');
      option.setAttribute('value', item);
      // option.setAttribute('data-zone', item);
      option.dataset.zone = item;
      option.innerText = self.multilanguage(item);
      this.doms.zoneSelector.appendChild(option);
    })
    const head = document.createElement('option');
    head.setAttribute('value', `head`);
    head.innerText = `-------`
    this.doms.zoneSelector.prepend(head);
  }

  // 渲染支援語言
  renderLangSelector() {
    // 將記錄在LocalStorage的使用者選取語言放在第一個
    let currentLangPrepend = [];
    this.supportedLanguages.forEach((item) => {
        item === this.userSelectedLang ? currentLangPrepend.unshift(item) : currentLangPrepend.push(item);
    })

    currentLangPrepend.forEach((item) => {
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
      this.doms.langSelector.appendChild(option);
    })
  }
  // 非動態資料的事件監聽
  setEventListener() {
    let self = this;

    // 語言選擇事件監聽;
    this.doms.langSelector.addEventListener('change', function(e){
      if (console) console.log("Current Language: " + e.target.value);
      self.userSelectedLang = e.target.value;
      self.setLocalStorage(self.localStorage.userLang, self.userSelectedLang);
      self.renderTimezone();
      self.renderZoneSelector();
    }, false);

    // 選擇地區事件監聽
    this.doms.zoneSelector.addEventListener('change', function(e){
      
      if(e.target.value == 'head') return;

      // 處理下拉選單資料 & 和使用者選擇地區資料
      self.supportedTimezone = self.supportedTimezone.filter((item) => {
        return item !== e.target.value;
      })
      if(self.userSelectedTimezone.indexOf(e.target.value) == -1) {
        self.userSelectedTimezone.push(e.target.value);
      }

      self.setLocalStorage(self.localStorage.userSelectedTimezone, self.userSelectedTimezone);
      self.setLocalStorage(self.localStorage.supportedTimezone, self.supportedTimezone);
      self.init();
      self.renderTimezone();
      self.renderZoneSelector();
    }, false);
  }
  // 初始化
  init() {
    // 將this.zone地區資料推送進this.toLocalStringConfig合併，並將新資料指向至this.dataCombine
    this.dataCombine = [];
    this.userSelectedTimezone.forEach((item) => {
      let cloneConfig = Object.assign({}, this.toLocalStringConfig);
      cloneConfig.timeZone = item;
      this.dataCombine.push(cloneConfig);
    })
  }
  // 時區資料和DOM渲染
  renderTimezone() {
    const wrapNode = document.querySelector('.content');

    // 每次更新移除子節點重新渲染
    while(wrapNode.hasChildNodes()) {
      wrapNode.removeChild(wrapNode.firstChild);
    }

    // 將toLocaleString() API產生的字串丟入this.timeStringData陣列中
    this.timeStringData = this.dataCombine.map((item) => {
      return new Date().toLocaleString(this.userSelectedLang, item);
    })
    
    // 將資料塞入子節點，渲染畫面
    this.timeStringData.forEach((item, index) => {

      const timeZoneParentNode = document.createElement('div');
      timeZoneParentNode.classList.add('content__item');
      
      const getItemHour = item.replace(/.*\s+(\d{1,2})\:\d+/gm, `$1`);  // 取得小時數字
      console.log(getItemHour);
      
      getItemHour >= 18 ? timeZoneParentNode.classList.add('night') : false;
      
      if (this.userSelectedLang == 'en') {
        let newItem = item.split(',');

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${(this.userSelectedTimezone[index].replace(/\w+\/(\w+)/, '$1')).replace(/\_/g, ` `).toUpperCase()}
          </div>
          <div class="information__date">
            ${newItem[0]}${newItem[1]}
          </div>
        </div>
        <div class="time">
          ${newItem[2]}
        </div>
        <div class="delete" data-zone="${this.userSelectedTimezone[index]}"></div>
        `
      } else if(this.userSelectedLang == 'ko-KR') {
        let newItem = item.split(' ');

        // 翻譯地名
        const KR = this.userSelectedTimezone.map((item) =>{
          return this.multilanguage(item);
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
        <div class="delete" data-zone="${this.userSelectedTimezone[index]}"></div>
        `
      } else if (this.userSelectedLang == 'zh-TW') {
        let newItem = item.split(' ');

        // 翻譯地名
        const TPE = this.userSelectedTimezone.map((item) =>{
          return this.multilanguage(item);
        })

        timeZoneParentNode.innerHTML = `
        <div class="information">
          <div class="information__title">
            ${TPE[index]}
          </div>
          <div class="information__date">
            ${newItem[0]}
          </div>
        </div>
        <div class="time">
          ${newItem[1]}
        </div>
        <div class="delete" data-zone="${this.userSelectedTimezone[index]}"></div>
        `
      } else if (this.userSelectedLang == 'ja-JP-u-ca-japanese') {
        let newItem = item.split(' ');

        // 翻譯地名
        const JP = this.userSelectedTimezone.map((item) =>{
          return this.multilanguage(item);
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
        <div class="delete" data-zone="${this.userSelectedTimezone[index]}"></div>
        `
      }
      wrapNode.appendChild(timeZoneParentNode);
      this.deleteButtonsListener();
    })
  }
  // 刪除時區事件監聽
  deleteButtonsListener() {
    const deleteBtn = document.querySelectorAll('.delete');
    const self = this;
    
    deleteBtn.forEach((item) => {
      item.addEventListener('click', function(e){
        // 只剩一筆資料時禁止刪除
        if(self.userSelectedTimezone.length === 1) return;

        // 處理下拉選單資料 & 和使用者選擇地區資料
        self.userSelectedTimezone = self.userSelectedTimezone.filter((item) => {
          return item !== e.target.dataset.zone
        })
        if(self.supportedTimezone.indexOf(e.target.dataset.zone)== -1) {
          self.supportedTimezone.push(e.target.dataset.zone);
        }

        self.setLocalStorage(self.localStorage.userSelectedTimezone, self.userSelectedTimezone);
        self.setLocalStorage(self.localStorage.supportedTimezone, self.supportedTimezone);
        self.init();
        self.renderTimezone();
        self.renderZoneSelector();
      }, false);
    })
  }
  // 多國語系
  multilanguage(item) {
    if(this.userSelectedLang === 'en') {
      return item.replace(/\w+\/(\w+)/, '$1').replace(/\_/g, ` `);

    } else if (this.userSelectedLang === 'zh-TW') {
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
    } else if (this.userSelectedLang === 'ja-JP-u-ca-japanese') {
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
    } else if (this.userSelectedLang === 'ko-KR') {
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
    }
  }
  // LocalStorage
  setLocalStorage(caption, data) {
    localStorage.setItem(caption, JSON.stringify(data));
  }
  getLocalStorage(caption) {
    return JSON.parse(localStorage.getItem(caption));
  }
}

const TZ = new TimeZone();