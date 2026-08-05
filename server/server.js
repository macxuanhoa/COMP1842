// Khai báo các thư viện cần thiết và định tuyến (routes)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const wordRoutes = require('./api/routes/wordRoutes');
const categoryRoutes = require('./api/routes/categoryRoutes');

// Khởi tạo cổng ứng dụng và ứng dụng Express
const port = process.env.PORT || 3000;
const app = express();

// Kết nối cơ sở dữ liệu MongoDB
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost/COMP1842_MacXuanHoa');

// Cấu hình các middleware cho ứng dụng (CORS, parse dữ liệu request body)
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Đăng ký các tuyến đường API từ vựng và danh mục
app.use(wordRoutes);
app.use(categoryRoutes);

// Middleware xử lý yêu cầu khi đường dẫn không tồn tại (Lỗi 404)
app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

// Khởi động server lắng nghe các kết nối trên cổng đã định
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

