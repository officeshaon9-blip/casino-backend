const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB কানেকশন (আপডেট করা)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/casino_db')
.then(() => {
    console.log('Database connected successfully');
})
.catch(err => {
    console.error('Database connection error:', err);
});

// ইউজার স্কিমা ও মডেল
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    nickname: { type: String, required: true },
    vipLevel: { type: String, default: 'VIP0' },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ['Normal', 'Blocked'], default: 'Normal' },
    depositToggle: { type: Boolean, default: true },
    withdrawToggle: { type: Boolean, default: true },
    totalDeposit: { type: Number, default: 0 },
    totalWithdraw: { type: Number, default: 0 },
    totalBets: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// ১. নতুন ইউজার তৈরি করার API
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ২. নির্দিষ্ট ইউজারের ইনফো দেখার API
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ৩. ইউজারের স্ট্যাটাস বা ব্যালেন্স আপডেট করার API
app.patch('/api/users/:userId/status', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// সার্ভার রান করা
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});