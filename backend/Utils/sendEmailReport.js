// utils/sendEmailReport.js
import nodemailer from "nodemailer";

export const sendEmailReport = async (pdfPath, recipientEmails = []) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use your SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Sewa Setu Reports" <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(", "),
      subject: "Sewa Setu - Monthly Impact Report",
      text: "Attached is the monthly public impact report from Sewa Setu.",
      attachments: [
        {
          filename: pdfPath.split("/").pop(),
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Report emailed successfully!");
  } catch (err) {
    console.error("❌ Error sending report email:", err);
  }
};
