module.exports = () =>
    `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tech Company Invoice</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .invoice-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 20px auto;
                    background-color: #fff;
                    border-radius: 5px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .invoice-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .invoice-header h1 {
                    margin: 0;
                }
                .invoice-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .invoice-details .left {
                    flex: 1;
                }
                .invoice-details .right {
                    flex: 1;
                    text-align: right;
                }
                .invoice-items {
                    margin-top: 20px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .item-row .item-name {
                    flex: 2;
                }
                .item-row .item-quantity,
                .item-row .item-price,
                .item-row .item-total {
                    flex: 1;
                    text-align: right;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                .total-row .total-label {
                    flex: 2;
                    font-weight: bold;
                }
                .total-row .total-amount {
                    flex: 1;
                    text-align: right;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <h1>Tech Company Invoice</h1>
                    <p>123 Tech Street, Silicon Valley, CA 12345</p>
                </div>
                <div class="invoice-details">
                    <div class="left">
                        <p>Invoice To:</p>
                        <p>John Doe</p>
                        <p>123 Customer Street</p>
                        <p>City, State 54321</p>
                    </div>
                    <div class="right">
                        <p>Invoice Number: INV2023-001</p>
                        <p>Invoice Date: August 7, 2023</p>
                        <p>Due Date: August 21, 2023</p>
                    </div>
                </div>
                <div class="invoice-items">
                    <div class="item-row">
                        <div class="item-name">Web Development Services</div>
                        <div class="item-quantity">2</div>
                        <div class="item-price">$500</div>
                        <div class="item-total">$1000</div>
                    </div>
                    <!-- Add more item rows here as needed -->
                </div>
                <div class="total-row">
                    <div class="total-label">Total Amount:</div>
                    <div class="total-amount">$1000</div>
                </div>
            </div>
        </body>
        </html>`;