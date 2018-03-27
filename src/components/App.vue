<template>
    <div>
        <div>
            <p class="hello"> Hello World</p>
        </div>
        <button @click="openFile()">Open File</button>
        <canvas id="can1"/>
        <div>
            <pre>{{showText}}</pre>
        </div>
    </div>
</template>

<script lang="ts">
// import { Component } from "vue";
import { Vue, Component as ComponentDecorator } from "vue-property-decorator";
import * as nedb from "nedb";
import { isNullOrUndefined } from "util";
import { remote } from "electron";
import {
  PDFJSStatic,
  PDFJSUtilStatic,
  PDFPageProxy,
  PDFDocumentProxy
} from "pdfjs-dist";
import * as moment from "moment";

// declare var PDFJS: PDFJSStatic

@ComponentDecorator({
  name: "App"
})
export default class App extends Vue {
  pdfjsLib: PDFJSStatic = window["pdfjs-dist/build/pdf"];
  db: nedb | null = null;
  showText: string = "Nothing Yet";
  docOne = {
    hello: "World",
    complex: {
      level: 2,
      svg: "<svg></svg>"
    }
  };
  docTwo = {
    hello: "No",
    complex: {
      level: 3,
      svg: "<svg><line/></svg>"
    }
  };
  docThree = {
    hello: "m'Lady",
    complex: {
      level: 4,
      svg: "<svg><polyline/><circle/></svg>"
    }
  };

  openFile() {
    if (isNullOrUndefined(this.db)) return;
    remote.dialog.showOpenDialog(
      {
        properties: ["openFile"],
        filters: [{ name: "PDFs", extensions: ["pdf"] }]
      },
      directoryPath => {
        // this.pdfjsLib.GlobalWorkerOptions.workerSrc = "../../node_modules/pdfjs-dist/build/pdf.worker.js";
        console.log(this.pdfjsLib);
        this.pdfjsLib.getDocument(directoryPath[0]).then(pdf => {
          console.log(`Found ${pdf.numPages} pages`);
          let startTime = moment();
          let renderFunc = (pageNum: number, canvas: HTMLCanvasElement) => {
            let canvasContext: CanvasRenderingContext2D = canvas.getContext("2d");
            if (pageNum < 1 || pageNum > pdf.numPages) return;
            console.log(`Starting page ${pageNum}`);
            pdf.getPage(pageNum).then(page => {
              let viewport = page.getViewport(1);
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              let renderContext = {
                canvasContext: canvasContext,
                viewport: viewport
              };
              page.render(renderContext).then(() => {
                let endTime = moment().diff(startTime);
                let newText =
                  "Loaded page " + page.pageNumber + " after " + moment(moment().diff(startTime)).format("mm:ss.SS") ;
                console.log(newText);
                this.showText += "\n" + newText;
                renderFunc(pageNum + 1, canvas);
              });
            });
          };

          let canvas1 = document.getElementById("can1") as HTMLCanvasElement;
          renderFunc(1, canvas1);
          // let endTime = moment();
          // let diffInMilli = endTime.diff(startTime);
          // alert(`Took ${diffInMilli} milliseconds`);
        });
      }
    );
  }

  mounted() {
    this.db = new nedb({
      filename: "C:\\nedbTests\\testOne.nedb",
      autoload: true
    });
    if (isNullOrUndefined(this.db)) return;

    this.db.insert(this.docOne, (err, newDoc) => {
      // this.showText = JSON.stringify(newDoc, null, 4);
    });
    this.db.insert(this.docTwo);
    this.db.insert(this.docThree);

    this.db.find(
      {
        "complex.level": {
          $lt: 4
        }
      },
      (err: Error, docs: any[]) => {
        // this.showText = JSON.stringify(docs, null, 4);
      }
    );
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
