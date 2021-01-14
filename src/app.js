const express = require('express')

const app = express()
app.all('/*', (req, res) => res.send('<html><body><h1>👋 Hello Mobify</h1></html>'))

module.exports = app