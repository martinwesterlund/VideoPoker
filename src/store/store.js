/* eslint-disable sort-keys */
import Vue from 'vue'
import Vuex from 'vuex'
import UUID from 'uuid/v4'


Vue.use(Vuex)

function playSound(sound) {
  if (store.state.soundOn) {
    new Audio(require('../../public/sounds/' + sound)).play()
  }
}



export const store = new Vuex.Store({
  state: {
    win: 0,
    variable: 'Testing testing',
    round: 0,
    cards: [],
    fiveRandomCards: [],
    finalCards: [],
    combination: 'COMBINATION',
    bet: 1,
    credits: 10,
    dealtCards: [],
    modern: true,
    soundOn: true,
    showSettings: false,
    startDisplay: true,
    resultDisplay: false,
    quizDisplay: false,
    answers: [],
    questionNumber: 0,
    gameInfo: 'WELCOME TO JACKS OR BETTER!',
    yourResult: {},


    combinations: [
      { type: 'ROYAL STRAIGHT FLUSH', value: 800 },
      { type: 'STRAIGHT FLUSH', value: 50 },
      { type: 'FOUR OF A KIND', value: 25 },
      { type: 'FULL HOUSE', value: 8 },
      { type: 'FLUSH', value: 6 },
      { type: 'STRAIGHT', value: 4 },
      { type: 'THREE OF A KIND', value: 3 },
      { type: 'TWO PAIR', value: 2 },
      { type: 'JACKS OR BETTER', value: 1 }
    ],

    
    
  },

  mutations: {

    // Creates deck automatically from start
    createDeck(state) {
      state.cards = []
      const suits = ['♥', '♠', '♦', '♣']
      const value = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K']

      for (let n = 0; n < suits.length; n++) {
        for (let m = 0; m < 13; m++) {

          state.cards.push({
            suit: suits[n],
            value: value[m],
            id: UUID(),
            locked: false

          })
        }
      }
    },

    // Creates five random cards that are displayed in the game
    getFiveRandomCards(state) {
      if (state.bet <= state.credits) { //IF WE CAN AFFORD TO PLAY; RUN THIS
        playSound('button.mp3')
        state.gameInfo = ''
        state.win = 0
        state.credits -= state.bet
        state.round = 1
        state.fiveRandomCards = []
        for (let i = 0; i < 5; i++) {
          let newCard = state.cards.splice((Math.floor(Math.random() * state.cards.length)), 1)
          state.fiveRandomCards.push(newCard[0])
          if (state.cards.length < 5) {
            this.commit('createDeck')
          }
        }
        state.combination = 'COMBINATION'
      } else {
        playSound('error.mp3')
        state.gameInfo = 'INSERT COIN'
      }

    },

    // Increases the bet
    insertCoin(state) {
      if (state.bet < 5 && state.bet < state.credits) {
        playSound('button.mp3')
        state.bet++
      } else {
        playSound('error.mp3')
      }
    },

    // Decreases the bet
    removeCoin(state) {
      if (state.bet > 1) {
        playSound('button.mp3')
        state.bet--
      } else {
        playSound('error.mp3')
      }
    },

    // Locks and unlocks a card that is clicked on
    toggleLock(state, id) {
      for (let i = 0; i < state.fiveRandomCards.length; i++) {
        if (state.fiveRandomCards[i].id == id) {
          playSound('click.mp3')
          state.fiveRandomCards[i].locked = !state.fiveRandomCards[i].locked
        }
      }
    },

    addCredits(state) {
      state.credits += 10
    },

    toggleTheme(state) {
      state.modern = !state.modern
      playSound('button.mp3')
    },

    toggleSound(state) {
      state.soundOn = !state.soundOn
      playSound('button.mp3')
    },

    toggleSettings(state) {
      state.showSettings = !state.showSettings
    },


    // Replaces the unlocked cards with new cards from the deck
    getMoreCards(state) {
      playSound('button.mp3')
      state.round = 0
      state.combination = 'COMBINATION'
      for (let i = 0; i < 5; i++) {
        if (state.fiveRandomCards[i].locked == false) {
          let newCard = state.cards.splice((Math.floor(Math.random() * state.cards.length)), 1)
          state.fiveRandomCards[i].value = newCard[0].value
          state.fiveRandomCards[i].suit = newCard[0].suit
        }
      }
      this.commit('calculateValue')
      state.gameInfo = 'GAME OVER'
    },

    // Calculates the final value of the final cards array, to see if you won or not
    calculateValue(state) {
      state.finalCards = []

      for (let i = 0; i < 5; i++) {
        switch (state.fiveRandomCards[i].value) {
          case 'A':
            state.finalCards.push({ suit: state.fiveRandomCards[i].suit, value: 14, locked: false })
            break
          case 'J':
            state.finalCards.push({ suit: state.fiveRandomCards[i].suit, value: 11, locked: false })
            break
          case 'Q':
            state.finalCards.push({ suit: state.fiveRandomCards[i].suit, value: 12, locked: false })
            break
          case 'K':
            state.finalCards.push({ suit: state.fiveRandomCards[i].suit, value: 13, locked: false })
            break
          default:
            state.finalCards.push({ suit: state.fiveRandomCards[i].suit, value: Number(state.fiveRandomCards[i].value), locked: false })
        }

      }



      //Sort final cards array
      state.finalCards.sort((a, b) => b.value < a.value ? 1 : b.value > a.value ? -1 : 0)

      // Check Royal flush
      if (state.finalCards[0].value == 10 &&
        state.finalCards[1].value == 11 &&
        state.finalCards[2].value == 12 &&
        state.finalCards[3].value == 13 &&
        state.finalCards[4].value == 14 &&
        state.finalCards[0].suit == state.finalCards[1].suit &&
        state.finalCards[1].suit == state.finalCards[2].suit &&
        state.finalCards[2].suit == state.finalCards[3].suit &&
        state.finalCards[3].suit == state.finalCards[4].suit) {
        this.commit('updateResult', 0)
      }

      // Check Straight flush
      else if (state.finalCards[0].value == state.finalCards[1].value - 1 &&
        state.finalCards[1].value == state.finalCards[2].value - 1 &&
        state.finalCards[2].value == state.finalCards[3].value - 1 &&
        state.finalCards[3].value == state.finalCards[4].value - 1 &&
        state.finalCards[0].suit == state.finalCards[1].suit &&
        state.finalCards[1].suit == state.finalCards[2].suit &&
        state.finalCards[2].suit == state.finalCards[3].suit &&
        state.finalCards[3].suit == state.finalCards[4].suit) {

        this.commit('updateResult', 1)
      }

      // Check four of a kind
      else if ((state.finalCards[0].value == state.finalCards[1].value && state.finalCards[1].value == state.finalCards[2].value && state.finalCards[2].value == state.finalCards[3].value) || (state.finalCards[1].value == state.finalCards[2].value && state.finalCards[2].value == state.finalCards[3].value && state.finalCards[3].value == state.finalCards[4].value)) {
        this.commit('updateResult', 2)
      }

      // Check full house
      else if ((state.finalCards[0].value == state.finalCards[1].value &&
        state.finalCards[1].value == state.finalCards[2].value &&
        state.finalCards[3].value == state.finalCards[4].value) ||
        (state.finalCards[0].value == state.finalCards[1].value &&
          state.finalCards[2].value == state.finalCards[3].value &&
          state.finalCards[3].value == state.finalCards[4].value)) {

        this.commit('updateResult', 3)
      }

      // Check Flush
      else if (state.finalCards[0].suit == state.finalCards[1].suit &&
        state.finalCards[1].suit == state.finalCards[2].suit &&
        state.finalCards[2].suit == state.finalCards[3].suit &&
        state.finalCards[3].suit == state.finalCards[4].suit) {
        this.commit('updateResult', 4)
      }

      // Check straight
      else if ((state.finalCards[0].value == state.finalCards[1].value - 1 &&
        state.finalCards[1].value == state.finalCards[2].value - 1 &&
        state.finalCards[2].value == state.finalCards[3].value - 1 &&
        state.finalCards[3].value == state.finalCards[4].value - 1) ||
        (state.finalCards[0].value == 2 &&
          state.finalCards[1].value == 3 &&
          state.finalCards[2].value == 4 &&
          state.finalCards[3].value == 5 &&
          state.finalCards[4].value == 14)) {
        this.commit('updateResult', 5)
      }

      // Check Three of a kind
      else if ((state.finalCards[0].value == state.finalCards[1].value && state.finalCards[1].value == state.finalCards[2].value) ||
        (state.finalCards[1].value == state.finalCards[2].value && state.finalCards[2].value == state.finalCards[3].value) ||
        (state.finalCards[2].value == state.finalCards[3].value && state.finalCards[3].value == state.finalCards[4].value)) {
        this.commit('updateResult', 6)
      }

      // Check Two pair
      else if ((state.finalCards[0].value == state.finalCards[1].value && state.finalCards[2].value == state.finalCards[3].value) ||
        (state.finalCards[0].value == state.finalCards[1].value && state.finalCards[3].value == state.finalCards[4].value) ||
        (state.finalCards[1].value == state.finalCards[2].value && state.finalCards[3].value == state.finalCards[4].value)) {

        this.commit('updateResult', 7)
      }

      //JACKS OR BETTER
      else if ((state.finalCards[0].value == state.finalCards[1].value && state.finalCards[0].value > 10) ||
        (state.finalCards[1].value == state.finalCards[2].value && state.finalCards[1].value > 10) ||
        (state.finalCards[2].value == state.finalCards[3].value && state.finalCards[2].value > 10) ||
        (state.finalCards[3].value == state.finalCards[4].value && state.finalCards[3].value > 10)) {
        this.commit('updateResult', 8)
      }

      else if (state.credits === 0) {
        playSound('gameover.mp3')
      }




    },

    updateResult(state, value) {
      playSound('win.mp3')
      state.combination = state.combinations[value].type
      state.credits += state.combinations[value].value * state.bet
      state.win = state.combinations[value].value * state.bet
    },


  },



})
