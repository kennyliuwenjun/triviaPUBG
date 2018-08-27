const path = require('path')
const express = require('express')

const clientPtah = path.join(__dirname,'../client');
const port = process.env.PORT || 3000
const app = express();

app.use(express.static(clientPtah));

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})
