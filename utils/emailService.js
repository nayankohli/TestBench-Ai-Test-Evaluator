const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {User,TempUser} = require('../models/index'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'parasthakurdell@gmail.com',
        pass: 'xoyw krof ovng rorf'
    },
    debug: false 
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function sendVerificationEmail(email, otp) {
    const mailOptions = {
      from: '"TestBench - AI Test Evaluator" <noreply@testbench.ai>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #e5e7eb;
              margin: 0;
              padding: 0;
              background-color: #111827;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #1f2937;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
              background: linear-gradient(135deg, #374151 0%, #1e3a8a 100%);
              padding: 30px 20px;
              text-align: center;
            }
            
            .logo {
              margin-bottom: 20px;
              font-size: 24px;
              font-weight: 700;
              color: white;
            }
            
            .header-title {
              font-size: 24px;
              font-weight: 600;
              color: white;
              margin: 0;
            }
            
            .email-body {
              padding: 30px;
              color: #e5e7eb;
            }
            
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: white;
            }
            
            .message {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 25px;
            }
            
            .otp-container {
              background-color: #374151;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
              text-align: center;
            }
            
            .otp-label {
              font-size: 14px;
              color: #9ca3af;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .otp-code {
              font-size: 32px;
              font-weight: 700;
              color: #3b82f6;
              letter-spacing: 8px;
              margin: 0;
            }
            
            .expiry-note {
              margin-top: 25px;
              padding: 15px;
              background-color: rgba(59, 130, 246, 0.1);
              border-left: 4px solid #3b82f6;
              border-radius: 4px;
              font-size: 14px;
              color: #9ca3af;
            }
            
            .expiry-note strong {
              color: #3b82f6;
            }
            
            .ignoring-note {
              margin-top: 30px;
              font-size: 14px;
              color: #9ca3af;
              font-style: italic;
            }
            
            .email-footer {
              background-color: #111827;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            
            .footer-links {
              margin-bottom: 10px;
            }
            
            .footer-links a {
              color: #9ca3af;
              text-decoration: none;
              margin: 0 10px;
            }
            
            .footer-links a:hover {
              text-decoration: underline;
              color: #3b82f6;
            }
            
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100%;
                border-radius: 0;
              }
              
              .email-header, .email-body, .email-footer {
                padding: 20px 15px;
              }
              
              .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="logo">TestBench</div>
              <h1 class="header-title">Verify Your Email Address</h1>
            </div>
            
            <div class="email-body">
              <p class="greeting">Hello,</p>
              
              <p class="message">
                Thank you for signing up with TestBench. To complete your registration and access your account, please verify your email address using the verification code below.
              </p>
              
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="expiry-note">
                <strong>Note:</strong> This verification code will expire in <strong>10 minutes</strong>. If you don't verify within this time, you'll need to request a new code.
              </div>
              
              <p class="ignoring-note">
                If you didn't create an account with TestBench, you can safely ignore this email.
              </p>
            </div>
            
            <div class="email-footer">
              <div class="footer-links">
                <a href="#">Help</a> •
                <a href="#">Privacy Policy</a> •
                <a href="#">Terms of Service</a>
              </div>
              <div>© 2025 TestBench. All rights reserved.</div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  
    return transporter.sendMail(mailOptions);
  }

  module.exports={
    sendVerificationEmail,
    generateOTP
  }