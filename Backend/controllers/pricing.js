const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ฟังก์ชันสำหรับการสร้าง pricing
const createPricing = async (req, res) => {
    const { service_type, unit_price, quantity, total_price } = req.body;
    try {
        const pricing = await prisma.pricing.create({
            data: {
                service_type,
                unit_price,
                quantity,
                total_price
            }
        });
        res.status(200).json(pricing);
    } catch (err) {
        res.status(500).json(err);
    }
};

// ฟังก์ชันสำหรับการอัปเดต pricing
const updatePricing = async (req, res) => {
    const { id_pricing, service_type, unit_price, quantity, total_price } = req.body;

    try {
        // ตรวจสอบการมีอยู่ของ id_pricing
        if (!id_pricing) {
            return res.status(400).json({ error: 'id_pricing is required' });
        }

        const pricing = await prisma.pricing.update({
            data: {
                service_type,
                unit_price,
                quantity,
                total_price
            },
            where: { id_pricing: Number(id_pricing) } // ใช้ Number เพื่อแปลงเป็นชนิด Int
        });

        res.status(200).json(pricing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ฟังก์ชันสำหรับการลบ pricing
const deletePricing = async (req, res) => {
    const id_pricing = req.params.id_pricing;
    try {
        const pricingExists = await prisma.pricing.findUnique({
            where: { id_pricing: Number(id_pricing) },
        });

        if (!pricingExists) {
            return res.status(404).json({ error: 'Pricing not found' });
        }

        const deletedPricing = await prisma.pricing.delete({
            where: { id_pricing: Number(id_pricing) },
        });

        res.status(200).json({ message: 'Pricing deleted successfully', deletedPricing });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete pricing', details: err });
    }
};

// ฟังก์ชันสำหรับการดึงข้อมูล pricing ทั้งหมด
const getPricings = async (req, res) => {
    try {
        const pricings = await prisma.pricing.findMany();
        res.status(200).json(pricings);
    } catch (err) {
        res.status(500).json(err);
    }
};

// ฟังก์ชันสำหรับการดึงข้อมูล pricing ที่ระบุด้วย id_pricing
const getPricing = async (req, res) => {
    const id_pricing = req.params.id_pricing;
    try {
        const pricing = await prisma.pricing.findUnique({
            where: { id_pricing: Number(id_pricing) },
        });
        if (!pricing) {
            return res.status(404).json({ message: 'Pricing not found' });
        } else {
            res.status(200).json(pricing);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createPricing,
    updatePricing,
    deletePricing,
    getPricings,
    getPricing,
};
