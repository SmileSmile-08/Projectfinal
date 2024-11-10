const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. ฟังก์ชันสร้างการแจ้งเตือนใหม่
const createNotification = async (req, res) => {
    const { UserId, Type } = req.body;

    try {
        const notification = await prisma.notifications.create({
            data: {
                UserId,
                Type,
            },
        });
        res.status(201).json(notification); // ส่งคืนการแจ้งเตือนที่สร้างขึ้น
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Error creating notification' }); // ส่งคืนข้อผิดพลาด
    }
};

// 2. ฟังก์ชันอัปเดตการแจ้งเตือนตาม ID
const updateNotification = async (req, res) => {
    const { id } = req.params; // ดึง ID จากพารามิเตอร์
    const { UserId, Type } = req.body;

    try {
        const updatedNotification = await prisma.notifications.update({
            where: { id: Number(id) },
            data: { UserId, Type },
        });
        res.status(200).json(updatedNotification); // ส่งคืนการแจ้งเตือนที่อัปเดตแล้ว
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Error updating notification' }); // ส่งคืนข้อผิดพลาด
    }
};

// 3. ฟังก์ชันลบการแจ้งเตือนตาม ID
const deleteNotification = async (req, res) => {
    const { id } = req.params; // ดึง ID จากพารามิเตอร์

    try {
        const deletedNotification = await prisma.notifications.delete({
            where: { id: Number(id) },
        });
        res.status(200).json(deletedNotification); // ส่งคืนการแจ้งเตือนที่ถูกลบ
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Error deleting notification' }); // ส่งคืนข้อผิดพลาด
    }
};

// 4. ฟังก์ชันดึงการแจ้งเตือนทั้งหมด
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notifications.findMany({
            include: {
                user_accounts: true, // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้อง
            },
        });
        res.status(200).json(notifications); // ส่งคืนการแจ้งเตือนทั้งหมด
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Error fetching notifications' }); // ส่งคืนข้อผิดพลาด
    }
};

// 5. ฟังก์ชันดึงการแจ้งเตือนตาม ID
const getNotification = async (req, res) => {
    const { id } = req.params; // ดึง ID จากพารามิเตอร์

    try {
        const notification = await prisma.notifications.findUnique({
            where: { id: Number(id) },
            include: {
                user_accounts: true, // ดึงข้อมูลผู้ใช้ที่เกี่ยวข้อง
            },
        });
        if (notification) {
            res.status(200).json(notification); // ส่งคืนการแจ้งเตือนที่ค้นพบ
        } else {
            res.status(404).json({ error: 'Notification not found' }); // แจ้งว่าไม่พบการแจ้งเตือน
        }
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Error fetching notification' }); // ส่งคืนข้อผิดพลาด
    }
};

module.exports = {
    createNotification,
    updateNotification,
    deleteNotification,
    getNotifications,
    getNotification,
};
