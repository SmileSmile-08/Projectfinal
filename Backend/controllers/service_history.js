const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createServiceHistory = async (req, res) => {
    const { user_id, service_name, appointment_date, status, warranty_end_date, amount_charged, location } = req.body;

    // ตรวจสอบว่าราคาต้องเป็นตัวเลขบวก
    if (isNaN(amount_charged) || Number(amount_charged) <= 0) {
        return res.status(400).json({ error: 'Amount Charged must be a positive number' });
    }

    try {
        const newHistory = await prisma.service_history.create({
            data: {
                user_id: user_id ? Number(user_id) : null,
                service_name: service_name || null,
                appointment_date: appointment_date ? new Date(appointment_date) : null,
                status: status || null,
                warranty_end_date: warranty_end_date ? new Date(warranty_end_date) : null,
                amount_charged: Number(amount_charged),
                location: location || null,
            },
        });

        res.status(201).json({ message: 'Service history created successfully', newHistory });
    } catch (error) {
        console.error('Error creating service history:', error);
        res.status(500).json({ error: 'Failed to create service history', details: error.message });
    }
};

// ฟังก์ชันอัปเดตประวัติการใช้บริการ
const updateServiceHistory = async (req, res) => {
    const { service_name, appointment_date, status, warranty_end_date, amount_charged, location } = req.body;

    // ตรวจสอบว่าราคาต้องเป็นตัวเลขบวก ถ้ามีการกรอกข้อมูล amount_charged มา
    if (amount_charged !== undefined && (isNaN(amount_charged) || Number(amount_charged) <= 0)) {
        return res.status(400).json({ error: 'Amount Charged must be a positive number' });
    }

    try {
        const updatedHistory = await prisma.service_history.update({
            where: { id: Number(req.params.id) },
            data: {
                service_name: service_name || null,
                appointment_date: appointment_date ? new Date(appointment_date) : null,
                status: status || null,
                warranty_end_date: warranty_end_date ? new Date(warranty_end_date) : null,
                amount_charged: amount_charged !== undefined ? Number(amount_charged) : undefined,
                location: location || null,
                updated_at: new Date(),
            },
        });

        res.status(200).json({ message: 'Service history updated successfully', updatedHistory });
    } catch (error) {
        console.error('Error updating service history:', error);
        res.status(500).json({ error: 'Failed to update service history', details: error.message });
    }
};


// ฟังก์ชันดึงข้อมูลประวัติการใช้บริการทั้งหมด
const getServiceHistories = async (req, res) => {
    try {
        const histories = await prisma.service_history.findMany({
            include: {
                user_accounts: { // รวมข้อมูลจากตาราง user_accounts
                    select: {
                        First_name: true,
                        Last_name: true,
                    }
                }
            },
        });

        const result = histories.map(history => ({
            ...history,
            user_name: history.user_accounts ? `${history.user_accounts.First_name} ${history.user_accounts.Last_name}` : 'Unknown'
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching service histories:', error);
        res.status(500).json({ error: 'Failed to fetch service histories', details: error.message });
    }
};

// ฟังก์ชันดึงประวัติการใช้บริการตาม user_id
const getServiceHistoryByUserId = async (req, res) => {
    const { user_id } = req.params;

    try {
        const serviceHistories = await prisma.service_history.findMany({
            where: { user_id: user_id ? Number(user_id) : null },
            include: {
                user_accounts: { // รวมข้อมูลจากตาราง user_accounts
                    select: {
                        First_name: true,
                        Last_name: true,
                    }
                }
            },
        });

        if (serviceHistories.length === 0) {
            return res.status(404).json({ message: 'No service history found for this user' });
        }

        const result = serviceHistories.map(history => ({
            ...history,
            user_name: history.user_accounts ? `${history.user_accounts.First_name} ${history.user_accounts.Last_name}` : 'Unknown'
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching service history:', error);
        res.status(500).json({ error: 'Failed to fetch service history', details: error.message });
    }
};



// ฟังก์ชันลบประวัติการใช้บริการ
const deleteServiceHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedHistory = await prisma.service_history.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Service history deleted successfully', deletedHistory });
    } catch (error) {
        console.error('Error deleting service history:', error);
        res.status(500).json({ error: 'Failed to delete service history', details: error.message });
    }
};

module.exports = {
    createServiceHistory,
    getServiceHistories,
    getServiceHistoryByUserId,
    updateServiceHistory,
    deleteServiceHistory
};
