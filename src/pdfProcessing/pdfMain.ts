// import {ipcRenderer} from 'electron'
import {
    PDFJSStatic,
    PDFRenderParams,
    PDFPageProxy,
    PDFDocumentProxy
} from 'pdfjs-dist'
import { ipcRenderer } from 'electron'
import { RenderContext } from 'vue'
import * as pdfjsLib from '../../node_modules/pdfjs-dist/build/pdf.js' //Ignore error for now...
let PDFJS: PDFJSStatic = pdfjsLib
PDFJS.disableTextLayer = true
PDFJS.disableWorker = true
;(PDFJS as any).GlobalWorkerOptions.workerSrc =
    '../../node_modules/pdfjs-dist/build/pdf.worker.js'

ipcRenderer.on('test', (event, message) => {
    alert('I did it! ' + message)
})

ipcRenderer.on('loadPdf', (event, message) => {
    alert('Loading: ' + message)
    PDFJS.getDocument(message).then(pdf => {
        console.log('Loaded pdf')
        renderPage(pdf, 1)
        for (let i = 2; i <= pdf.numPages; i++) {
            setTimeout(() => {
                renderPage(pdf, i)
            }, 5000 * i)
        }
    })
})

function renderPage(pdf: PDFDocumentProxy, pageNum: number) {
    pdf.getPage(pageNum).then(page => {
        console.log('loaded page 1')
        let viewport = page.getViewport(1)
        let canvas = document.getElementById('myCanvas') as HTMLCanvasElement
        let canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D
        canvas.height = viewport.height
        canvas.width = viewport.width
        let renderContext: PDFRenderParams = {
            canvasContext,
            viewport
        }
        page.render(renderContext).then(() => {
            const canvasDataStr = canvas.toDataURL()
            ipcRenderer.send('pdfCanvas', canvasDataStr)
        })
    })
}

console.log('script processed')
