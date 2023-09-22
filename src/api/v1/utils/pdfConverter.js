const puppeteer = require('puppeteer');
const express = require('express');
const router = express.Router();
const path = require("path");

const invoiceFormatUtils = require('../utils/invoiceFormatUtils');

async function convertHtmlToImage(html, width, height) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const screenshot = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: width, height: height } });
    await browser.close();
    return screenshot;
  }

  async function convertToPDF(html){
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);

    //Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4'
    });

    //Save PDF to file
    const filePath = await invoiceFormatUtils.saveFile(pdfBuffer);

    //Close browser
    await browser.close();
    
    return filePath;

  }

module.exports = {
  convertHtmlToImage,
  convertToPDF
}
