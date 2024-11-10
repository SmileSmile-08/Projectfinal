const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ฟังก์ชันสำหรับการสร้างนัดหมาย
const createSchedule = async (req, res) => {
    const { appointment_date, appointment_time, status, note } = req.body;

    try {
        // ตรวจสอบฟอร์แมตเวลาที่เป็น HH:mm
        if (!/^\d{2}:\d{2}$/.test(appointment_time)) {
            return res.status(400).json({ error: 'Invalid time format. Expected HH:mm.' });
        }

        const newSchedule = await prisma.schedule.create({
            data: {
                appointment_date: new Date(appointment_date), // เก็บเฉพาะวันที่
                appointment_time: appointment_time, // เก็บเวลาในฟอร์แมต HH:mm
                status,
                note,
            },
        });
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับการอัปเดตนัดหมาย
const updateSchedule = async (req, res) => {
    const id = parseInt(req.params.id);
    const { appointment_date, appointment_time, status, note } = req.body;

    try {
        // ตรวจสอบฟอร์แมตเวลาที่เป็น HH:mm
        if (!/^\d{2}:\d{2}$/.test(appointment_time)) {
            return res.status(400).json({ error: 'Invalid time format. Expected HH:mm.' });
        }

        const updatedSchedule = await prisma.schedule.update({
            where: { id_schedule: id },
            data: {
                appointment_date: new Date(appointment_date),
                appointment_time: appointment_time, // เก็บเวลาในฟอร์แมต HH:mm
                status,
                note,
            },
        });
        res.status(200).json(updatedSchedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับการลบนัดหมาย
const deleteSchedule = async (req, res) => {
    const id = parseInt(req.params.id, 10); // รับ id จากพารามิเตอร์

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        // ตรวจสอบว่านัดหมายมีอยู่จริงหรือไม่
        const existingSchedule = await prisma.schedule.findUnique({
            where: { id_schedule: id },
        });

        if (!existingSchedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // ลบนัดหมาย
        await prisma.schedule.delete({
            where: { id_schedule: id },
        });

        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ฟังก์ชันสำหรับการดึงข้อมูลนัดหมายทั้งหมด
const getSchedules = async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany();
        console.log('Fetched schedules:', schedules); // Log ข้อมูลที่ดึงมา
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันสำหรับการดึงข้อมูลนัดหมายที่ระบุด้วย id
const getSchedule = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id_schedule: id },
        });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export ฟังก์ชันทั้งหมด
module.exports = {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedules,
    getSchedule,
};
