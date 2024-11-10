const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



// ฟังก์ชันแชทบอตสำหรับตอบคำถาม
const chatbot = async (req, res) => {
    const { message } = req.body;

    try {
        const botResponse = await prisma.chatbot.findFirst({
            where: {
                keyword: {
                    equals: message // ตรวจสอบว่า message ที่ส่งมาตรงกับ keyword แบบตรงกันเป๊ะ ๆมากก
                }
            },
        });
        

        if (!botResponse) {
            return res.status(404).json({ reply: 'ขอโทษค่ะ ฉันไม่เข้าใจคำถามของคุณ' });
        }

        res.status(200).json({ reply: botResponse.response });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'An error occurred during the chatbot process' });
    }
};

// ฟังก์ชันเพิ่มคำถามและตอบกลับใหม่
const createChatbot = async (req, res) => {
    const { keyword, response } = req.body;

    try {
        const newResponse = await prisma.chatbot.create({
            data: {
                keyword,
                response
            }
        });
        res.status(200).json({ message: 'Response added successfully', response: newResponse });
    } catch (error) {
        console.error('Add chatbot response error:', error);
        res.status(500).json({ error: 'Failed to add chatbot response' });
    }
};

// ฟังก์ชันอัปเดตคำตอบที่มีอยู่
const updateChatbot = async (req, res) => {
    const { id } = req.params;
    const { keyword, response } = req.body;

    try {
        const updatedResponse = await prisma.chatbot.update({
            where: { id: Number(id) },
            data: { keyword, response },
        });

        res.status(200).json({ message: 'Response updated successfully', updatedResponse });
    } catch (error) {
        console.error('Update chatbot response error:', error);
        res.status(500).json({ error: 'Failed to update chatbot response' });
    }
};

// ฟังก์ชันลบคำตอบที่มีอยู่
const deleteChatbot = async (req, res) => {
    const { id } = req.params;

    try {
        const existingResponse = await prisma.chatbot.findUnique({
            where: { id: Number(id) },
        });

        if (!existingResponse) {
            return res.status(404).json({ error: 'Response not found' });
        }

        const deletedResponse = await prisma.chatbot.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'Response deleted successfully', deletedResponse });
    } catch (error) {
        console.error('Delete chatbot response error:', error);
        res.status(500).json({ error: 'Failed to delete chatbot response' });
    }
};

// ฟังก์ชันดึงคำตอบทั้งหมด
const getChatbotResponses = async (req, res) => {
    try {
        const responses = await prisma.chatbot.findMany();
        res.status(200).json(responses);
    } catch (error) {
        console.error('Error fetching chatbot responses:', error);
        res.status(500).json({ error: 'Failed to fetch chatbot responses' });
    }
};

// ฟังก์ชันดึงคำตอบตาม ID
const getChatbotResponse = async (req, res) => {
    const { id } = req.params;

    try {
        const response = await prisma.chatbot.findUnique({
            where: { id: Number(id) },
        });

        if (!response) {
            return res.status(404).json({ error: 'Response not found' });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Get chatbot response error:', error);
        res.status(500).json({ error: 'Failed to fetch chatbot response' });
    }
};

// ฟังก์ชันดึงคำถามอัตโนมัติ
const getAutoQuestions = async (req, res) => {
    try {
        const questions = await prisma.chatbot.findMany({
            select: { keyword: true }
        });
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching auto questions:', error);
        res.status(500).json({ error: 'Failed to fetch auto questions' });
    }
};

module.exports = {
    chatbot,
    createChatbot,
    updateChatbot,
    deleteChatbot,
    getChatbotResponses,
    getChatbotResponse,
    getAutoQuestions
};
