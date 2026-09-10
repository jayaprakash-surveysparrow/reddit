require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT)===465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((err, success) => {
    if(err){
        logger.error('SMTP connection error', {error: err.message});
    }
    else{
        logger.info('SMTP Connection is successfull...');
    }
});

module.exports = {transporter, MAIL_FROM: process.env.MAIL_FROM};