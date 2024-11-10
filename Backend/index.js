require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api'); // นำเข้า router หลัก

const app = express();
const port = 8080;

// ใช้งาน CORS และกำหนด origin ของ frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// กำหนด middleware
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// ใช้ router หลักที่มีเส้นทาง API ต่าง ๆ
app.use('/api/v1', apiRouter);

app.listen(port, () => {
    console.log("Server listening on port:" + port);
});
