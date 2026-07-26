const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Category = require('./api/models/categoryModel');
const wordRoutes = require('./api/routes/wordRoutes');
const categoryRoutes = require('./api/routes/categoryRoutes');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost/COMP1842_MacXuanHoa');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(wordRoutes);
app.use(categoryRoutes);

app.use((req, res) => {
    res.status(404).send({ url: `${req.originalUrl} not found` });
});

const initGeneralCategory = async () => {
    try {
        const categories = await Category.find({});
        const general = categories.find(
            c => c.name.trim().toLowerCase() === 'general'
        );
        if (!general) {
            await new Category({ name: 'General' }).save();
            console.log('General category created');
        }
    } catch (err) {
        console.error('Error initializing General category:', err);
    }
};

initGeneralCategory();

app.listen(port);
console.log(`Server started on port ${port}`);
