const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000
app.use(cors())

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})