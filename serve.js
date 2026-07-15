const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(express.static(__dirname));
app.use('/api/gang', require('./gangRoutes'));

app.listen(process.env.PORT || 3000);
