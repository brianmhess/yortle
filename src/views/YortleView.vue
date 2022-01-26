<template>
  <div class="main">
    <v-row align="center" justify="center">
      <v-card max-width="600">
        <v-container>
          <v-row justify="center">
            <div @click="chooseWord">
              <img alt="The Turtle" src="../assets/logo.png" width="200">
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
              <p class="text-center">Yordle <a :href="`http://localhost:9999/${secretIdx}`">{{secretIdx}}</a> {{ nextGuess }}/6</p>
              <p class="text-center" v-for="(r, idx) in cutAndPastable()" :key="idx"> {{ r }} </p>
              <div class="text-center"><v-btn color="green" @click="copySuccess">Share your success</v-btn></div>
            </v-card>
          <!-- </v-row> -->
        </v-dialog>
        <v-dialog v-model="wordNotFound" width="500" height="100">
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
          <v-container v-if="gameWon">
            <v-row/>
            <v-row justify="center">
              <v-btn color="green" @click="gameWonDialog = true">Share Your Success</v-btn>
            </v-row>
            <v-row/>
            <v-row justify="center">
              <v-btn color="blue" @click="chooseWord">Choose Another Secret Word</v-btn>
            </v-row>
            <v-row/>
          </v-container>

          <v-container v-else>
            <v-row v-for="(r,idx) in letters" :key="idx">
              <v-col v-if="idx == 2" cols="1"/>
              <v-col v-for="jdx in Array(r.length).keys()" :key="jdx">
                <v-chip text-color="black" :color="keyColor(r.charAt(jdx))" @click="onKeyPress(r.charAt(jdx))"> {{ r.charAt(jdx) }} </v-chip>
              </v-col>
              <v-col v-if="idx == 1">
                <v-chip color="black" outlined @click="onKeyPress('{del}')"> Del </v-chip>
              </v-col>
              <v-col v-if="idx == 2">
                <v-chip color="black" outlined @click="onKeyPress('{enter}')"> Enter </v-chip>
              </v-col>
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
    }
  },
  created() {
    if (this.$route.params.gameidx < 0)
      this.chooseWord()
    this.secretWord = this.wordList[this.secretIdx]
    window.addEventListener("keyup", e => this.onKeyboardPress(e))
    this.$watch(() => this.$route.params, () => {this.reset()})
    console.log("Env: ", process.env)
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
      this.secretIdx = this.$route.params.gameidx
      this.secretWord = this.wordList[this.secretIdx]
    },
    chooseWord() {
      this.$router.push({name: "YortleView", params: {gameidx: Math.floor(Math.random() * this.wordList.length)}})
    },
    wonGame() {
      this.gameWon = true;
      this.gameWonDialog = true;
      var summary = {
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
      navigator.clipboard.writeText(retstr);
      console.log("copySuccess\n", retstr)
    },
  }
}
</script>

<style>
.min-button::before {
  display: none;
}
</style>
