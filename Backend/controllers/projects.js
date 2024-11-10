const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตรวจสอบว่าโฟลเดอร์ 'uploads' มีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ตั้งค่า multer เพื่ออัพโหลดไฟล์ไปที่โฟลเดอร์ 'uploads' และใช้ชื่อไฟล์เดิม
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // เก็บไฟล์ในโฟลเดอร์ uploads
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // ใช้ชื่อไฟล์เดิม
    }
});
const upload = multer({ storage });

// สร้างโปรเจกต์ใหม่
const createProject = async (req, res) => {
    const { title, description } = req.body;
    let imageUrl = '';

    // ตรวจสอบการอัปโหลดไฟล์
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`; // เก็บ URL ของไฟล์ที่อัพโหลด
    }

    try {
        // สร้างโปรเจกต์ใหม่ในฐานข้อมูล
        const project = await prisma.projects.create({
            data: {
                title,         // ชื่อของโปรเจกต์
                description,   // รายละเอียดของโปรเจกต์
                image_url: imageUrl || null,  // URL ของรูปภาพโปรเจกต์ ถ้าไม่มีไฟล์ให้เป็น null
            },
        });
        // ส่งข้อมูลโปรเจกต์ที่ถูกสร้างกลับไปยัง client
        res.status(200).json(project);
    } catch (err) {
        // ส่งข้อความแสดงความล้มเหลวพร้อมรายละเอียดของข้อผิดพลาด
        res.status(500).json({ error: 'Failed to create project', details: err.message });
    }
};

// อัปเดตโปรเจกต์
const updateProject = async (req, res) => {
    const id_projects = req.params.id_projects;
    const { title, description } = req.body;
    let imageUrl = req.body.image_url; // เก็บ URL เดิม

    // ตรวจสอบการอัปโหลดไฟล์
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`; // เปลี่ยน URL รูปภาพเป็นไฟล์ใหม่
    }

    try {
        // อัปเดตข้อมูลโปรเจกต์
        const updatedProject = await prisma.projects.update({
            where: {
                id_projects: Number(id_projects),
            },
            data: {
                title,
                description,
                image_url: imageUrl || null, // ถ้าไม่มีไฟล์ใหม่ ให้เก็บ URL เดิมหรือ null
            },
        });
        // ส่งข้อมูลโปรเจกต์ที่อัปเดตแล้วกลับไปยัง client
        res.status(200).json(updatedProject);
    } catch (err) {
        // ส่งข้อความแสดงความล้มเหลวพร้อมรายละเอียดของข้อผิดพลาด
        res.status(500).json({ error: 'Failed to update project', details: err.message });
    }
};

// ลบโปรเจกต์
const deleteProject = async (req, res) => {
    const id_projects = req.params.id_projects;

    try {
        // ตรวจสอบว่ามีโปรเจกต์ที่มี id_projects นี้อยู่หรือไม่
        const projectExists = await prisma.projects.findUnique({
            where: {
                id_projects: Number(id_projects),
            },
        });

        if (!projectExists) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // ลบโปรเจกต์
        const deletedProject = await prisma.projects.delete({
            where: {
                id_projects: Number(id_projects),
            },
        });

        res.status(200).json({ message: 'Project deleted successfully', deletedProject });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete project', details: err.message });
    }
};

// ดึงโปรเจกต์ตาม id
const getProjectsById = async (req, res) => {
    const id_projects = req.params.id_projects;

    try {
        const project = await prisma.projects.findUnique({
            where: {
                id_projects: Number(id_projects),
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve project', details: err.message });
    }
};

// ดึงข้อมูลโปรเจกต์ทั้งหมด
const getProjects = async (req, res) => {
    try {
        const projects = await prisma.projects.findMany();
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve projects', details: err.message });
    }
};

module.exports = {
    createProject,
    updateProject,
    deleteProject,
    getProjects,
    getProjectsById,
    upload, // Export upload สำหรับใช้ใน route
};
