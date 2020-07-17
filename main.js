const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
  }
  
  const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
    'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
  ]
  
  
  //介面
  const view = {
    getCardElement (index) {
      return `<div data-index="${index}" class="card back"></div>`
    },
  
    getCardContent (index) {　//index0~51
      const number = this.transformNumber((index % 13) + 1)　//數字
      const symbol = Symbols[Math.floor(index / 13)] //符號
  
      return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>
      `
    },
  　　
    //數字轉換英文，部分CASE不用轉換
    transformNumber (number) {
      switch (number) {
        case 1:
          return 'A'
        case 11:
          return 'J'
        case 12:
          return 'Q'
        case 13:
          return 'K'
        default:
          return number
      }
    },
  
    displayCards (indexes) {
      const rootElement = document.querySelector('#cards')
      rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')　　
    },
  
    flipCards (...cards) {
      cards.map(card => {
        if (card.classList.contains('back')) {
          card.classList.remove('back')
          card.innerHTML = this.getCardContent(Number(card.dataset.index))　//HTML回傳字串,改數字
          return
        }
        card.classList.add('back')
        card.innerHTML = null　　//翻回背面
      })
    },
  
    pairCards (...cards) {
      cards.map(card => {
        card.classList.add('paired')
      })
    },
  
    renderScore (score) {
      document.querySelector('.score').textContent = `Score: ${score}`
    },
  
    renderTriedTimes (times) {　//累積TRY次數
      document.querySelector('.tried').textContent = `You've tried: ${times} times`
    },
  
    appendWrongAnimation (...cards) {　
      cards.map(card => {
        card.classList.add('wrong')
        card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
      })//熟悉ANIMATIONED
    },
  
    showGameFinished () {
      const div = document.createElement('div')
  
      div.classList.add('completed')
      div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
      `
      const header = document.querySelector('#header')
      header.before(div)
    }
  }
  
  const model = {
    
    //初始宣告SCORE AND TRIEDTIMES
    score: 0,
  
    triedTimes: 0,
    
    revealedCards: [],
  
    isRevealedCardsMatched () {  //配對檢查器
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },
  
  
  }
  
  const controller = {
    
    //當下狀態
    currentState: GAME_STATE.FirstCardAwaits,
  
    generateCards () {
      view.displayCards(utility.getRandomNumberArray(52))
    },
  
    dispatchCardAction (card) {
      if (!card.classList.contains('back')) {
        return
      }
  
      //分別對照5種狀態
      switch (this.currentState) {
        case GAME_STATE.FirstCardAwaits:
          view.flipCards(card)
          model.revealedCards.push(card)
          this.currentState = GAME_STATE.SecondCardAwaits
          break
  
        case GAME_STATE.SecondCardAwaits:
          view.renderTriedTimes(++model.triedTimes)
  
          view.flipCards(card)
          model.revealedCards.push(card)
  
          // 判斷配對是否成功
          if (model.isRevealedCardsMatched()) {
            // 配對成功
            view.renderScore(model.score += 10)
  
            this.currentState = GAME_STATE.CardsMatched
            view.pairCards(...model.revealedCards)
            model.revealedCards = []
  
            if (model.score === 260) {
              console.log('showGameFinished')
              this.currentState = GAME_STATE.GameFinished
              view.showGameFinished()
              return
            }
  
            this.currentState = GAME_STATE.FirstCardAwaits
          } else {
            // 配對失敗
            this.currentState = GAME_STATE.CardsMatchFailed
            view.appendWrongAnimation(...model.revealedCards)
            setTimeout(this.resetCards, 1000)
          }
          break
      }
      
      console.log('this.currentState', this.currentState)
      console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },
  
    resetCards () {
      view.flipCards(...model.revealedCards)　//翻回
      model.revealedCards = []
      controller.currentState = GAME_STATE.FirstCardAwaits
    }
  }
  
  const utility = {
    getRandomNumberArray (count) {
      const number = Array.from(Array(count).keys())
      for (let index = number.length - 1; index > 0; index--) {
        let randomIndex = Math.floor(Math.random() * (index + 1))
          ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
      }
      return number
    }
  }
  
  controller.generateCards()
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
      controller.dispatchCardAction(card)
    })
  })
  