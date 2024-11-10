const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const validAdminToken = process.env.ADMIN_TOKEN;

// ฟังก์ชันล็อกอิน
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user_accounts.findFirst({ where: { Email: email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            user_id: user.ID,
            username: user.Username,
            email: user.Email,
            isAdmin: user.isAdmin,
        });
    } catch (error) {
        res.status(500).json({ error: `An error occurred during login: ${error.message}` });
    }
};

// ฟังก์ชันสมัครสมาชิก
const registerUser = async (req, res) => {
    const { username, first_name, last_name, email, password, isAdmin, adminToken } = req.body;

    // ตรวจสอบโทเค็นก่อนสมัครเป็นแอดมิน
    if (isAdmin && adminToken !== validAdminToken) {
        return res.status(403).json({ error: "Unauthorized admin registration attempt" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user_accounts.create({
            data: {
                Username: username,
                First_name: first_name,
                Last_name: last_name,
                Email: email,
                Password: hashedPassword,
                isAdmin: isAdmin || false,
            },
        });

        res.json({ message: "User created successfully", user_id: newUser.ID });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
};

// ฟังก์ชันสร้างผู้ใช้
const createUser_account = async (req, res) => {
    const { username, email, password, first_name, last_name, isAdmin } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const cust = await prisma.user_accounts.create({
            data: {
                Username: username,
                Email: email,
                Password: hashedPassword,
                First_name: first_name,
                Last_name: last_name,
                isAdmin: isAdmin ?? false,
            }
        });
        res.status(201).json({ message: 'User created successfully', user: cust });
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถสร้างผู้ใช้ได้', details: err.message });
    }
};

// ฟังก์ชันแก้ไขข้อมูลผู้ใช้
const updateUser_account = async (req, res) => {
    const { user_id, username, first_name, last_name } = req.body;

    try {
        const user = await prisma.user_accounts.findUnique({ where: { ID: Number(user_id) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedData = {
            Username: username,
            First_name: first_name,
            Last_name: last_name,
        };

        const cust = await prisma.user_accounts.update({
            data: updatedData,
            where: { ID: Number(user_id) }
        });
        res.status(200).json(cust);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ฟังก์ชันลบผู้ใช้
const deleteUser_account = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user_accounts.findUnique({ where: { ID: Number(id) } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await prisma.user_accounts.delete({ where: { ID: Number(id) } });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
const getUser_accounts = async (req, res) => {
    try {
        const users = await prisma.user_accounts.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user accounts' });
    }
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม ID
const getUser_account = async (req, res) => {
    const ID = req.params.ID;
    try {
        const cust = await prisma.user_accounts.findUnique({
            where: { ID: Number(ID) },
            select: {
                Username: true,
                Email: true,
                First_name: true,
                Last_name: true,
                isAdmin: true,
            }
        });
        if (!cust) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(cust);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ฟังก์ชันค้นหาผู้ใช้ตามชื่อหรืออีเมล
const getUser_accountsByTerm = async (req, res) => {
    const searchString = req.params.term;
    try {
        const custs = await prisma.user_accounts.findMany({
            where: {
                OR: [
                    { First_name: { contains: searchString } },
                    { Email: { contains: searchString } }
                ]
            },
        });
        if (!custs || custs.length === 0) {
            res.status(404).json({ message: 'Customer not found!' });
        } else {
            res.status(200).json(custs);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Export ฟังก์ชันทั้งหมดเพื่อใช้ใน router
module.exports = {
    loginUser,
    registerUser,  // เพิ่มฟังก์ชันสมัครสมาชิก
    createUser_account,
    updateUser_account,
    deleteUser_account,
    getUser_accounts,
    getUser_account,
    getUser_accountsByTerm,
};
