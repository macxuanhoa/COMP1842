const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const wordRoutes = require('./api/routes/wordRoutes');
const categoryRoutes = require('./api/routes/categoryRoutes');

const port = process.env.PORT || 3000;
const app = express();

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost/COMP1842_MacXuanHoa');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(wordRoutes);
app.use(categoryRoutes);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
