const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ฟังก์ชันสร้างรีวิว
const createReview = async (req, res) => {
    console.log('Received data:', req.body); // ตรวจสอบข้อมูลที่ถูกส่งมาจาก frontend
    const { user_id, comment, rating } = req.body;
  
    if (!user_id || !comment) {
      return res.status(400).json({ error: 'user_id and comment are required' });
    }
  
    try {
      const review = await prisma.reviews.create({
        data: {
          user_id,
          comment,
          rating: rating || 5,
        },
      });
      res.status(201).json(review);
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ error: 'Failed to create review', details: err });
    }
  };
  

// ฟังก์ชันดึงรีวิวทั้งหมด
const getReviews = async (req, res) => {
    try {
        const reviews = await prisma.reviews.findMany({
            include: {
                user_accounts: true, // แสดงข้อมูลผู้ใช้ที่ทำการรีวิว
            },
        });
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews', details: err });
    }
};

// ฟังก์ชันแก้ไขรีวิว
const updateReview = async (req, res) => {
    const { comment, rating } = req.body;
    const { id_reviews } = req.params;

    try {
        // ตรวจสอบว่ามีรีวิวนี้อยู่จริงหรือไม่
        const reviewExists = await prisma.reviews.findUnique({
            where: { id_reviews: Number(id_reviews) },
        });

        if (!reviewExists) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const review = await prisma.reviews.update({
            where: { id_reviews: Number(id_reviews) },
            data: {
                comment: comment || reviewExists.comment, // ถ้าไม่ได้ส่ง comment มา ใช้ค่าเดิม
                rating: rating || reviewExists.rating, // ถ้าไม่ได้ส่ง rating มา ใช้ค่าเดิม
            },
        });
        res.status(200).json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review', details: error.message });
    }
};

// ฟังก์ชันลบรีวิว
const deleteReview = async (req, res) => {
    const { id_reviews } = req.params;

    try {
        const reviewExists = await prisma.reviews.findUnique({
            where: { id_reviews: Number(id_reviews) },
        });

        if (!reviewExists) {
            return res.status(404).json({ error: 'Review not found' });
        }

        await prisma.reviews.delete({
            where: { id_reviews: Number(id_reviews) },
        });

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ error: 'Failed to delete review', details: err });
    }
};

// ฟังก์ชันค้นหารีวิว
const getReviewsByTerm = async (req, res) => {
    const searchString = req.params.term;
    try {
        const reviews = await prisma.reviews.findMany({
            where: {
                comment: {
                    contains: searchString,
                    mode: 'insensitive', // ค้นหาไม่สนใจตัวพิมพ์ใหญ่-เล็ก
                }
            },
        });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found!' });
        } else {
            res.status(200).json(reviews);
        }
    } catch (err) {
        console.error('Error searching reviews:', err);
        res.status(500).json({ error: 'Failed to search reviews', details: err });
    }
};

// ฟังก์ชันดึงรีวิวตาม ID
const getReviewById = async (req, res) => {
    const { id_reviews } = req.params;
    try {
        const review = await prisma.reviews.findUnique({
            where: { id_reviews: Number(id_reviews) },
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (err) {
        console.error('Error fetching review:', err);
        res.status(500).json({ error: 'Failed to fetch review', details: err });
    }
};

// ส่งออกฟังก์ชันทั้งหมด
module.exports = {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    getReviewById,
    getReviewsByTerm,
};
