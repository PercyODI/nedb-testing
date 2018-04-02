<template>
    <div>
        <div>
            <p class="hello"> Hello World</p>
        </div>
        <button @click="openFile()">Open File</button>
        <img :src="canvasElem">
        <div>
            <pre>{{showText}}</pre>
        </div>
    </div>
</template>

<script lang="ts">
// import { Component } from "vue";
import { Vue, Component as ComponentDecorator } from 'vue-property-decorator'
import * as nedb from 'nedb'
import { isNullOrUndefined, error } from 'util'
import { ipcRenderer } from 'electron'
import {
  PDFJSStatic,
  PDFJSUtilStatic,
  PDFPageProxy,
  PDFDocumentProxy
} from 'pdfjs-dist'
import * as moment from 'moment'
import { remote } from 'electron'

// declare var PDFJS: PDFJSStatic

@ComponentDecorator({
  name: 'App'
})
export default class App extends Vue {
  pdfjsLib: PDFJSStatic = window['pdfjs-dist/build/pdf']
  db: nedb | null = null
  showText: string = 'Nothing Yet'
  docOne = {
    hello: 'World',
    complex: {
      level: 2,
      svg: '<svg></svg>'
    }
  }
  docTwo = {
    hello: 'No',
    complex: {
      level: 3,
      svg: '<svg><line/></svg>'
    }
  }
  docThree = {
    hello: "m'Lady",
    complex: {
      level: 4,
      svg: '<svg><polyline/><circle/></svg>'
    }
  }
  canvasElem: string | null = null
  openFile() {
    if (isNullOrUndefined(this.db)) return
    console.log('sending')
    ipcRenderer.on('pdfCanvas', (event, canvas: HTMLCanvasElement) => {
      console.log(canvas)
      this.canvasElem = canvas
    })
    remote.dialog.showOpenDialog(
      {
        properties: ['openFile'],
        filters: [{ name: 'PDFs', extensions: ['pdf'] }]
      },
      directoryPath => {
        console.log('Received windowReady. Sending ' + directoryPath[0])
        ipcRenderer.send('asyncMessage', {
          ipcName: 'loadPdf',
          message: directoryPath[0]
        })
        // ipcRenderer.send('testStart')
      }
    )
  }

  mounted() {
    this.db = new nedb({
      filename: 'C:\\nedbTests\\testOne.nedb',
      autoload: true
    })
    if (isNullOrUndefined(this.db)) return

    this.db.insert(this.docOne, (err, newDoc) => {
      // this.showText = JSON.stringify(newDoc, null, 4);
    })
    this.db.insert(this.docTwo)
    this.db.insert(this.docThree)

    this.db.find(
      {
        'complex.level': {
          $lt: 4
        }
      },
      (err: Error, docs: any[]) => {
        // this.showText = JSON.stringify(docs, null, 4);
      }
    )
  }
}
</script>

<style lang="scss" scoped>
.hello {
  padding-top: 5px;
}

canvas {
  display: none;
}
</style>
