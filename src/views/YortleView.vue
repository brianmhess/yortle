<template>
  <div class="main">
    <v-row align="center" justify="center">
      <v-card max-width="410">
        <v-card-title>
          <v-row>
            <v-spacer/>
            <v-btn fab @click="showHelp = true"><v-icon>mdi-help</v-icon></v-btn>
          </v-row>
        </v-card-title>
        <v-dialog v-model="showHelp" max-width="410">
          <v-card>
            <v-card-title class="justify-center">How to play</v-card-title>
            <v-card-subtitle class="justify-center">Guess the word in 6 tries.</v-card-subtitle>
            <v-card-text>
              <p>Each guess must be a valid 5 letter word</p>
              <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
              <v-divider/>
              <ul>
                <li>A <font color="green">green</font> letter box means the letter is correct and in the correct space.</li>
                <li>An <font color="orange">orange</font> letter box means the letter is in the word, but in the wrong space.</li>
                <li>A <b>grey</b> letter box means the letter is not in the word.</li>
              </ul>
              <v-divider/>
              <p>You can share this puzzle for this secret word by sharing the URL. Each word has an ID.</p>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-container>
          <v-row justify="center">
            <div @click="chooseWord">
              <img alt="Get another word" src="../assets/logo.png" width="200">
            </div>
          </v-row>
          <v-row><p/></v-row>
        </v-container>
        <v-divider/>
        <v-dialog v-model="gameWonDialog" max-width="400">
          <!-- <v-row align="center" justify="center"> -->
            <v-card>
              <v-card-title class="justify-center">You got it!</v-card-title>
              <v-card-subtitle class="text-center">{{secretWord ? secretWord.toUpperCase() : "{none}"}}</v-card-subtitle>
              <p class="text-center">Yordle <a :href="`https://brianmhess.github.io/yortle/${secretIdx}`">{{secretIdx}}</a> {{ nextGuess }}/6</p>
              <p class="text-center" v-for="(r, idx) in cutAndPastable()" :key="idx"> {{ r }} </p>
              <div class="text-center"><v-btn color="green" @click="copySuccess">Share your success</v-btn></div>
            </v-card>
          <!-- </v-row> -->
        </v-dialog>
        <v-snackbar v-model="snackbar" timeout="3000">
          Saved to your clipboard
        </v-snackbar>
        <v-dialog v-model="wordNotFound" width="410" height="100">
          <v-card>
            <v-card-title class="justify-center">Word not found in dictionary</v-card-title>
          </v-card>
        </v-dialog>
        <v-container>
          <v-row v-for="(guess,idx) in guesses" :key="idx">
            <v-col cols="1"></v-col>
            <v-col v-for="jdx in Array(5).keys()" :key="jdx" cols="2">
              <v-btn depressed :ripple="false" tile :outlined="idx >= nextGuess" :color="boxColor(idx,jdx)" width="15" class="ma-0 min-button">{{ jdx > guess.length ? "" : guess.charAt(jdx) }}</v-btn>
            </v-col>
            <v-col cols="1"></v-col>
          </v-row>
        </v-container>
        <v-divider/>
        <v-card>
          <v-container v-if="gameWon || gameLost">
            <v-row/>
            <v-row justify="center" v-if="gameWon">
              <v-btn color="green" @click="gameWonDialog = true">Share Your Success</v-btn>
            </v-row>
            <v-row justfiy="center" v-if="gameLost">
              <v-col cols="12">
                <v-card-title class="justify-center">You LOST! The word was: {{ secretWord ? secretWord.toUpperCase() : "{none}" }}</v-card-title>
              </v-col>
            </v-row>
            <v-row/>
            <v-row justify="center">
              <v-btn color="blue" @click="chooseWord">Choose Another Secret Word</v-btn>
            </v-row>
            <v-row/>
          </v-container>

          <v-container v-else>
            <v-row v-for="(r,idx) in letters" :key="idx" justify="center">
              <!-- <v-col v-if="idx == 2" cols="1"/>
              <v-col v-for="jdx in Array(r.length).keys()" :key="jdx">
                <v-chip text-color="black" :color="keyColor(r.charAt(jdx))" @click="onKeyPress(r.charAt(jdx))"> {{ r.charAt(jdx) }} </v-chip>
              </v-col>
              <v-col v-if="idx == 1">
                <v-chip color="black" outlined @click="onKeyPress('{del}')"> Del </v-chip>
              </v-col>
              <v-col v-if="idx == 2">
                <v-chip color="black" outlined @click="onKeyPress('{enter}')"> Enter </v-chip>
              </v-col> -->
              <v-chip class="ma-1" v-for="jdx in Array(r.length).keys()" :key="jdx" ext-color="black" :color="keyColor(r.charAt(jdx))" @click="onKeyPress(r.charAt(jdx))"> {{ r.charAt(jdx) }} </v-chip>
              <v-chip class="ma-1" v-if="idx == 1" color="black" outlined @click="onKeyPress('{del}')"> Del </v-chip>
              <v-chip class="ma-1" v-if="idx == 2" color="black" outlined @click="onKeyPress('{enter}')"> Enter </v-chip>
            </v-row>
          </v-container>
        </v-card>
      </v-card>
    </v-row>
  </div>
</template>

<script>
import jsdata from '../allowedWords.json'

export default {
  name: 'App',
  components: {
  },
  data: function() {
    return {
      wordList: jsdata.wordList,
      allowedWords: jsdata.allowedWords,
      secretIdx: this.$route.params.gameidx,
      secretWord: null,
      guesses: ["", "", "", "", "", ""],
      nextGuess: 0,
      nextLetter: 0,
      guessed: [],
      letters: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
      great: [],
      good: [],
      wordNotFound: false,
      gameWon: false,
      gameWonDialog: false,
      gameLost: false,
      snackbar: false,
      showHelp: false,
    }
  },
  created() {
    // console.log(this.$route.params)
    this.$watch(() => this.$route.params, () => {this.reset()})
    if (this.$route.params.gameidx < 0)
      this.chooseWord()
    this.secretWord = this.wordList[this.secretIdx]
    window.addEventListener("keyup", e => this.onKeyboardPress(e))
  },
  methods: {
    reset() {
      this.guesses.splice(0,this.guesses.length,"","","","","","")
      this.nextGuess = 0
      this.nextLetter = 0
      this.guessed = []
      this.great = []
      this.good = []
      this.gameWon = false
      this.gameLost = false
      this.secretIdx = this.$route.params.gameidx
      this.secretWord = this.wordList[this.secretIdx]
    },
    chooseWord() {
      this.$router.push({name: "YortleView", params: {gameidx: Math.floor(Math.random() * this.wordList.length)}})
    },
    lostGame() {
      this.gameLost = true
      var summary = {
        result: "lost",
        secretIdx: this.secretIdx,
        secretWord: this.secretWord,
        guesses: this.guesses,
      }
      console.log(summary)
    },
    wonGame() {
      this.gameWon = true;
      this.gameWonDialog = true;
      var summary = {
        result: "won",
        secretIdx: this.secretIdx,
        secretWord: this.secretWord,
        numGuesses: this.nextGuess,
        guesses: this.guesses.slice(0,this.nextGuess),
        success: this.cutAndPastable()
      }
      console.log(summary)
    },
    onKeyboardPress(e) {
      if (e.keyCode == 13) {
        this.onKeyPress("{enter}")
        return
      }
      if ((e.keyCode == 8) || (e.keyCode == 46)) {
        this.onKeyPress("{del}")
        return
      }
      var k = String.fromCharCode(e.keyCode).toLowerCase()
      if (this.letters[0].includes(k) || this.letters[1].includes(k) || this.letters[2].includes(k)) {
        this.onKeyPress(k)
        return
      }
      return
    },
    onKeyPress(button) {
      if (this.gameWon)
        return
      if (button == "{del}") {
        if (this.nextLetter == 0)
          return
        this.guesses.splice(this.nextGuess, 1, this.guesses[this.nextGuess].substring(0, this.guesses[this.nextGuess].length-1))
        this.nextLetter = this.nextLetter - 1
        return
      }
      if (this.nextLetter < 5) {
        if (button != "{enter}") {
          this.guesses.splice(this.nextGuess, 1, this.guesses[this.nextGuess].concat(button))
          this.nextLetter = this.nextLetter + 1;
          return
        }
      }
      else {
        if (button == "{enter}") {
          if (this.allowedWords.includes(this.guesses[this.nextGuess]) || this.wordList.includes(this.guesses[this.nextGuess])) {
            if (this.nextGuess < 6) {
              for (var l of this.guesses[this.nextGuess].split("")) {
                if (!this.guessed.includes(l))
                  this.guessed.push(l)
              }
              this.nextGuess = this.nextGuess + 1
              this.nextLetter = 0
              if (this.guesses[this.nextGuess-1] == this.secretWord) {
                this.wonGame()
              }
              if ((this.nextGuess > 5) && !this.gameWon) {
                this.lostGame();
              }
              this.checkLetters()
            }
          }
          else {
            this.wordNotFound = true;
          }
        }
      }
    },
    checkLetters() {
      var good = []
      var great = []
      for (var idx of Array(this.nextGuess).keys()) {
        for (var jdx of Array(this.guesses[idx].length).keys()) {
          var l = this.guesses[idx].charAt(jdx)
          if (this.secretWord.charAt(jdx) == l) {
            if (!great.includes(l)) {
              great.push(l)
            }
          }
          else if (this.secretWord.includes(l)) {
            if (!good.includes(l)) {
              good.push(l)
            }
          }
        }
      }
      for (var g in great ) {
        var i = good.indexOf(g)
        if (i >= 0) {
          good.splice(i, 1)
        }
      }
      this.good = good
      this.great = great
    },
    keyColor(c) {
      if (this.great.includes(c))
        return "green"
      if (this.good.includes(c))
        return "orange"
      if (this.guessed.includes(c))
        return "grey"
      return "grey lighten-3"
    },
    boxColor(idx, jdx) {
      if (idx < this.nextGuess) {
        if (this.secretWord) {
          if (this.secretWord.charAt(jdx) == this.guesses[idx].charAt(jdx))
            return "green"
          if (!this.secretWord.includes(this.guesses[idx].charAt(jdx)))
            return "grey lighten-2"
          var l = this.guesses[idx].charAt(jdx)
          var sa = this.secretWord.split("")
          var ga = this.guesses[idx].split("")
          for (var i of Array(sa.length).keys()) {
            if (sa[i] == ga[i]) {
              sa.splice(i,1,"")
              ga.splice(i,1,"")
            }
          }
          if (jdx > 0) {
            for (var j of Array(jdx).keys()) {
              if (ga[j] == l) {
                var x = sa.indexOf(l)
                if (x >= 0)
                  sa.splice(x,1)
              }
            }
          }
          if (sa.includes(l))
            return "orange"
          return "grey lighten-2"
        }
        else
          return "grey lighten-2"
      }
      return "black"
    },
    cutAndPastable() {
      // const colorlookup = {
      //   "green":  "🟩",
      //   "grey lighten-2": "⬜",
      //   "orange": "🟨",
      //   "black": "X"
      // }
      const colorlookup = {
        "green": String.fromCodePoint(0x1F7E9),
        "grey lighten-2": String.fromCodePoint(0x2B1C),
        "orange": String.fromCodePoint(0x1F7E7),
        "black": "X"
      }
      var retstr = []
      for (var i of Array(this.nextGuess).keys()) {
        var tstr = ""
        for (var j of Array(5).keys()) {
          var c = this.boxColor(i, j)
          tstr = tstr.concat(colorlookup[c])
        }
        retstr.push(tstr)
      }
      return retstr
    },
    copySuccess() {
      var tstr = this.cutAndPastable()
      var retstr = `Yortle ${this.secretIdx} ${this.nextGuess}/6\n`
      retstr = retstr.concat(tstr.join("\n"))
      retstr = retstr.concat(`\nhttps://brianmhess.github.io/yortle/${this.secretIdx}`)
      navigator.clipboard.writeText(retstr);
      console.log("copySuccess\n", retstr)
      this.snackbar = true
    },
  }
}
</script>

<style>
.min-button::before {
  display: none;
}
</style>
