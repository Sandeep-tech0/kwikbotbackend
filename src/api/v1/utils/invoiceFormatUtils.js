const fs = require('fs');
const moment = require('moment');

class InvoiceUtils {
  static getHtml(invoice, userPerformer) {
    const imageLink = "https://kwikbot.ai/images/kwikbot-bran-logo.png"
    const invoiceDate = moment(invoice.invoiceDate).format("DD MMM YYYY");
    const GSTamount = invoice.amount * (invoice.GST / 100);
    const totalAmount = parseInt(invoice.amount) + parseInt(GSTamount);
    const AmountInWords = this.convertNumberToWords(totalAmount);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
              * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              }
        </style>
    </head>
    <body>
          <div style="width: 900px; margin: 0 auto;">
              <table style="border-collapse: collapse; border: 1px solid #cccc; width: 100%;">
                   <thead  style="border-bottom: 1px solid #cccc;">
                      <tr>
                          <th style="padding: 20px;">
                           <img src=${imageLink} alt=""> <!-- Corrected the image source -->
                        </th>
                          <th colspan="2" style="padding: 20px; text-align: left;"> <p style="font-size: 30px"><b>Kwikbot</b></p> 
                                  <p>Sector 74 A, Gurgaon</p>
                                  <p>Phone: 4789487556 </p>
                                  <p>Pan No: AAACZ5230C</p>
                                  <p>CIN: U52100TN2011PTC080778</p>
                                  <p>Service Tax No: AAACZ5230CSD</p>
                                  <p>Tan No: CHEZ03269A</p>
                                  <p>GSTIN: 33AAACZ5230C1ZU</p>
                        </th>
                           <th style="padding: 20px;">
                              <p style="font-size: 20px;">Tax Invoice</p>
                           </th>
                      </tr>
                   </thead>
                   <tbody>
                       <tr style="border-bottom: 1px solid #cccc;">
                         <td colspan="2" style="border-right: 1px solid #cccc; padding: 20px;"> 
                            <div style="display: flex; margin-bottom: 15px;  justify-content: space-between;">
                            <p>INVOICE#:</p> <p><b>${invoice.invoiceNumber}</b></p>
                         </div>
                          <div style="display: flex; justify-content: space-between;">
                              <p>DATE:</p>
                              <p><b>${invoiceDate}</b></p>
                          </div>
                        </td>
                         <td style="padding: 20px;">
                            <div style="display: flex; margin-bottom: 15px; justify-content: space-between;">
                                <p>Name Of State:</p> <p><b>Madhya Pradesh</b></p>
                             </div>
                         </td>
                         <td>
                             
                         </td>
                       </tr>
                       <tr>
                           <td colspan="4" style="padding: 20px; border-bottom: 1px solid #cccc; background-color: #cccccc;"><p>Bill to ${userPerformer.firstName} ${userPerformer.lastName}</p></td>
                       </tr>

                       <tr>
                           <td style="padding: 20px; border-bottom: 1px solid #cccc;" colspan="4">
                            <p> <b>${invoice.title}</b> </p>
                            <p> ${userPerformer.country}</p>
                            <p>${invoice.email}</p>
                           </td>
                       </tr>

                         <tr> 
                              <td colspan="3" rowspan="" style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccccc;"> <p><b>Item & Description</b></p></td>
                                <td>
                                     <table>
                                          <tr>
                                             <td rowspan="2" style="padding: 20px; border-right: 1px solid #cccc; border-bottom: 1px solid #cccc;"><p>amount</p></td>
                                                <td colspan="2" style="padding: 20px; border-bottom: 1px solid #cccc; border-right: 1px solid #ccc;"><p>CGST+SGST</p></td>
                                                <td rowspan="2"  style="padding: 20px; border-bottom: 1px solid #cccc; border-right: 1px solid #cccccc;"><p>Amount</p></td>
                                          </tr>
                                          <tr><td style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccc;">%</td>
                                             <td style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccc;">Amt</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 20px; border-bottom: 1px solid #cccccc; border-right: 1px solid #cccccc;"><p>${invoice.amount}</p></td>
                                            <td style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccccc;"  ><p>${GSTamount}</p></td>
                                            <td style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccccc;"  ><p>0</p></td>
                                            <td style="padding: 20px; border-right: 1px solid #cccccc; border-bottom: 1px solid #cccccc;"  ><p>${totalAmount}</p></td>
                                        </tr>
                                     </table>
                                </td>
                         </tr>
                         <tr>
                            <td style="padding: 20px; border-bottom: 1px solid #ccc;" colspan="4">
                               <p>Service: Subscription</p>
                            </td>
                         </tr>
                         <tr>
                              <td style="padding: 20px; border-bottom: 1px solid #ccc; border-right: 1px solid #cccc;" colspan="3"><p>Total In Words </p>
                               <p>${AmountInWords}</p>
                               <p>Thanks for your business.</p>
                             </td>

                            <td style="padding: 20px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <p><b>Total</b></p>
                                    <p><b>${totalAmount}</b></p>
                                </div>
                            </td>
                         </tr>
                   </tbody>
                </table>   
            </div>
    </body>
    </html>`;
  }

  static convertNumberToWords(num) {
    if (num === 0) return "Zero";

    const units = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"
    ];

    const teens = [
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const thousands = ["", "Thousand", "Million", "Billion"];

    const numStr = num.toString();

    const getChunkInWords = (chunk) => {
      let chunkStr = "";

      const hundredDigit = Math.floor(chunk / 100);
      if (hundredDigit > 0) {
        chunkStr += units[hundredDigit] + " Hundred";
        chunk %= 100;
      }

      if (chunk >= 10 && chunk <= 19) {
        if (chunkStr !== "") chunkStr += " ";
        chunkStr += teens[chunk - 10];
      } else {
        const tenDigit = Math.floor(chunk / 10);
        if (tenDigit > 0) {
          if (chunkStr !== "") chunkStr += " ";
          chunkStr += tens[tenDigit];
          chunk %= 10;
        }

        const unitDigit = chunk % 10;
        if (unitDigit > 0) {
          if (chunkStr !== "") chunkStr += " ";
          chunkStr += units[unitDigit];
        }
      }

      return chunkStr;
    };

    let result = "";
    let chunkIndex = 0;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        const chunkInWords = getChunkInWords(chunk);
        if (chunkInWords !== "") {
          if (result !== "") result = chunkInWords + " " + thousands[chunkIndex] + " " + result;
          else result = chunkInWords + " " + thousands[chunkIndex];
        }
      }

      num = Math.floor(num / 1000);
      chunkIndex++;
    }

    return result;
  }
}

async function saveFile(file) {
  //for getting time like yymmddhms
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  console.log(timestamp);

  const filePath = `uploads/invoices/${timestamp}.pdf`;

  fs.writeFile(filePath, file, (err) => {
    if (err) throw err;
    console.log('Image saved!');
  });

  const fileNameWithPath = filePath.replace("uploads", "/resources");

  return fileNameWithPath;
}

module.exports = {
  saveFile,
  InvoiceUtils: InvoiceUtils,
};
