import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});


export const sendOTPEmail = async (email: string, otp: string) => {
    await transporter.sendMail({
        from: `"Food Delivery System" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Xác nhận tài khoản - Mã OTP",

        html: `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận tài khoản</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        background-color: #f4f6f8;
                        padding: 40px 20px;
                    "
                >
                    <tr>
                        <td align="center">

                            <!-- CONTAINER -->
                            <table
                                width="600"
                                cellpadding="0"
                                cellspacing="0"
                                style="
                                    max-width: 600px;
                                    width: 100%;
                                    background-color: #ffffff;
                                    border-radius: 12px;
                                    overflow: hidden;
                                "
                            >

                                <!-- HEADER -->
                                <tr>
                                    <td style="
                                        background-color: #ff6b35;
                                        padding: 28px 30px;
                                        text-align: center;
                                    ">
                                        <h1 style="
                                            margin: 0;
                                            color: #ffffff;
                                            font-size: 24px;
                                        ">
                                            Food Delivery System
                                        </h1>
                                    </td>
                                </tr>

                                <!-- CONTENT -->
                                <tr>
                                    <td style="
                                        padding: 40px 40px 30px;
                                    ">

                                        <h2 style="
                                            margin: 0 0 15px;
                                            color: #111827;
                                            font-size: 22px;
                                        ">
                                            Xác nhận tài khoản
                                        </h2>

                                        <p style="
                                            margin: 0 0 20px;
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                        ">
                                            Cảm ơn bạn đã đăng ký tài khoản
                                            tại Food Delivery System.
                                            Vui lòng sử dụng mã OTP bên dưới
                                            để xác nhận email của bạn.
                                        </p>

                                        <!-- OTP BOX -->
                                        <div style="
                                            margin: 30px 0;
                                            padding: 25px;
                                            background-color: #f3f4f6;
                                            border-radius: 10px;
                                            text-align: center;
                                        ">

                                            <p style="
                                                margin: 0 0 10px;
                                                color: #6b7280;
                                                font-size: 14px;
                                            ">
                                                Mã xác nhận của bạn
                                            </p>

                                            <div style="
                                                font-size: 36px;
                                                font-weight: bold;
                                                letter-spacing: 8px;
                                                color: #ff6b35;
                                            ">
                                                ${otp}
                                            </div>

                                        </div>

                                        <p style="
                                            margin: 0 0 10px;
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            ⏱ Mã OTP có hiệu lực trong
                                            <strong>5 phút</strong>.
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            Nếu bạn không thực hiện đăng ký
                                            tài khoản này, bạn có thể bỏ qua
                                            email này.
                                        </p>

                                    </td>
                                </tr>

                                <!-- FOOTER -->
                                <tr>
                                    <td style="
                                        padding: 20px 40px;
                                        background-color: #f9fafb;
                                        border-top: 1px solid #e5e7eb;
                                        text-align: center;
                                    ">

                                        <p style="
                                            margin: 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                            line-height: 1.5;
                                        ">
                                            Đây là email tự động,
                                            vui lòng không trả lời email này.
                                        </p>

                                        <p style="
                                            margin: 8px 0 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                        ">
                                            © 2026 Food Delivery System
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>
                </table>

            </body>
            </html>
        `
    });
}

export const sendPasswordEmail = async (email: string, password: string) => {
    await transporter.sendMail({
        from: `"Food Delivery System" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Thông tin đăng nhập - Food Delivery System",

        html: `
            <!DOCTYPE html>
            <html lang="vi">

            <head>
                <meta charset="UTF-8">
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >
                <title>Thông tin đăng nhập</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        background-color: #f4f6f8;
                        padding: 40px 20px;
                    "
                >
                    <tr>
                        <td align="center">

                            <!-- CONTAINER -->
                            <table
                                width="600"
                                cellpadding="0"
                                cellspacing="0"
                                style="
                                    max-width: 600px;
                                    width: 100%;
                                    background-color: #ffffff;
                                    border-radius: 12px;
                                    overflow: hidden;
                                "
                            >

                                <!-- HEADER -->
                                <tr>
                                    <td style="
                                        background-color: #ff6b35;
                                        padding: 28px 30px;
                                        text-align: center;
                                    ">

                                        <h1 style="
                                            margin: 0;
                                            color: #ffffff;
                                            font-size: 24px;
                                        ">
                                            Food Delivery System
                                        </h1>

                                    </td>
                                </tr>


                                <!-- CONTENT -->
                                <tr>
                                    <td style="
                                        padding: 40px 40px 30px;
                                    ">

                                        <h2 style="
                                            margin: 0 0 15px;
                                            color: #111827;
                                            font-size: 22px;
                                        ">
                                            Thông tin đăng nhập
                                        </h2>


                                        <p style="
                                            margin: 0 0 20px;
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                        ">
                                            Tài khoản của bạn đã được tạo
                                            thành công trên
                                            <strong>
                                                Food Delivery System
                                            </strong>.
                                            Dưới đây là thông tin đăng nhập
                                            của bạn:
                                        </p>


                                        <!-- ACCOUNT INFO -->
                                        <div style="
                                            margin: 25px 0;
                                            padding: 25px;
                                            background-color: #f3f4f6;
                                            border-radius: 10px;
                                        ">

                                            <!-- EMAIL -->
                                            <p style="
                                                margin: 0 0 8px;
                                                color: #6b7280;
                                                font-size: 14px;
                                            ">
                                                Email
                                            </p>

                                            <p style="
                                                margin: 0 0 20px;
                                                color: #111827;
                                                font-size: 16px;
                                                font-weight: bold;
                                                word-break: break-word;
                                            ">
                                                ${email}
                                            </p>


                                            <!-- PASSWORD -->
                                            <p style="
                                                margin: 0 0 8px;
                                                color: #6b7280;
                                                font-size: 14px;
                                            ">
                                                Mật khẩu
                                            </p>

                                            <div style="
                                                padding: 15px;
                                                background-color: #ffffff;
                                                border: 1px solid #d1d5db;
                                                border-radius: 8px;
                                                text-align: center;
                                            ">

                                                <span style="
                                                    color: #ff6b35;
                                                    font-size: 24px;
                                                    font-weight: bold;
                                                    letter-spacing: 2px;
                                                ">
                                                    ${password}
                                                </span>

                                            </div>

                                        </div>


                                        <!-- WARNING -->
                                        <div style="
                                            margin: 20px 0;
                                            padding: 15px;
                                            background-color: #fff7ed;
                                            border-left: 4px solid #ff6b35;
                                            border-radius: 4px;
                                        ">

                                            <p style="
                                                margin: 0;
                                                color: #9a3412;
                                                font-size: 14px;
                                                line-height: 1.6;
                                            ">
                                                <strong>Lưu ý:</strong>
                                                Vui lòng đăng nhập và thay đổi
                                                mật khẩu sau lần đăng nhập đầu tiên
                                                để đảm bảo an toàn cho tài khoản.
                                            </p>

                                        </div>


                                        <p style="
                                            margin: 20px 0 0;
                                            color: #6b7280;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            Nếu bạn không yêu cầu tạo tài khoản
                                            này, vui lòng liên hệ quản trị viên
                                            của hệ thống.
                                        </p>

                                    </td>
                                </tr>


                                <!-- FOOTER -->
                                <tr>
                                    <td style="
                                        padding: 20px 40px;
                                        background-color: #f9fafb;
                                        border-top: 1px solid #e5e7eb;
                                        text-align: center;
                                    ">

                                        <p style="
                                            margin: 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                            line-height: 1.5;
                                        ">
                                            Đây là email tự động,
                                            vui lòng không trả lời email này.
                                        </p>

                                        <p style="
                                            margin: 8px 0 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                        ">
                                            © 2026 Food Delivery System
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>
                </table>

            </body>

            </html>
        `
    });
}

export const sendAccountToMail = async (toEmail: string, accountEmail: string, password: string) => {
    await transporter.sendMail({
        from: `"Food Delivery System" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: "Thông tin đăng nhập tài khoản Quán - Food Delivery System",

        html: `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thông tin tài khoản Quán</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                        background-color: #f4f6f8;
                        padding: 40px 20px;
                    "
                >
                    <tr>
                        <td align="center">

                            <!-- CONTAINER -->
                            <table
                                width="600"
                                cellpadding="0"
                                cellspacing="0"
                                style="
                                    max-width: 600px;
                                    width: 100%;
                                    background-color: #ffffff;
                                    border-radius: 12px;
                                    overflow: hidden;
                                "
                            >

                                <!-- HEADER -->
                                <tr>
                                    <td style="
                                        background-color: #ff6b35;
                                        padding: 28px 30px;
                                        text-align: center;
                                    ">
                                        <h1 style="
                                            margin: 0;
                                            color: #ffffff;
                                            font-size: 24px;
                                        ">
                                            Food Delivery System
                                        </h1>
                                    </td>
                                </tr>

                                <!-- CONTENT -->
                                <tr>
                                    <td style="
                                        padding: 40px 40px 30px;
                                    ">

                                        <h2 style="
                                            margin: 0 0 15px;
                                            color: #111827;
                                            font-size: 22px;
                                        ">
                                            Thông tin tài khoản Quán
                                        </h2>

                                        <p style="
                                            margin: 0 0 20px;
                                            color: #4b5563;
                                            font-size: 15px;
                                            line-height: 1.6;
                                        ">
                                            Tài khoản quản lý Quán của bạn đã được
                                            tạo thành công trên Food Delivery System.
                                            Vui lòng sử dụng thông tin bên dưới để
                                            đăng nhập vào hệ thống.
                                        </p>

                                        <!-- ACCOUNT INFO -->
                                        <div style="
                                            margin: 30px 0;
                                            padding: 25px;
                                            background-color: #f3f4f6;
                                            border-radius: 10px;
                                        ">

                                            <!-- ACCOUNT EMAIL -->
                                            <p style="
                                                margin: 0 0 8px;
                                                color: #6b7280;
                                                font-size: 14px;
                                            ">
                                                Email đăng nhập
                                            </p>

                                            <p style="
                                                margin: 0 0 20px;
                                                color: #111827;
                                                font-size: 16px;
                                                font-weight: bold;
                                                word-break: break-word;
                                            ">
                                                ${accountEmail}
                                            </p>

                                            <!-- PASSWORD -->
                                            <p style="
                                                margin: 0 0 8px;
                                                color: #6b7280;
                                                font-size: 14px;
                                            ">
                                                Mật khẩu
                                            </p>

                                            <div style="
                                                padding: 15px;
                                                background-color: #ffffff;
                                                border: 1px solid #d1d5db;
                                                border-radius: 8px;
                                                text-align: center;
                                            ">
                                                <span style="
                                                    color: #ff6b35;
                                                    font-size: 24px;
                                                    font-weight: bold;
                                                    letter-spacing: 2px;
                                                ">
                                                    ${password}
                                                </span>
                                            </div>

                                        </div>

                                        <p style="
                                            margin: 0 0 10px;
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            Vui lòng bảo mật thông tin đăng nhập
                                            và không chia sẻ mật khẩu với người khác.
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #4b5563;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        ">
                                            Bạn có thể đổi mật khẩu sau khi đăng nhập
                                            vào hệ thống.
                                        </p>

                                    </td>
                                </tr>

                                <!-- FOOTER -->
                                <tr>
                                    <td style="
                                        padding: 20px 40px;
                                        background-color: #f9fafb;
                                        border-top: 1px solid #e5e7eb;
                                        text-align: center;
                                    ">

                                        <p style="
                                            margin: 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                            line-height: 1.5;
                                        ">
                                            Đây là email tự động,
                                            vui lòng không trả lời email này.
                                        </p>

                                        <p style="
                                            margin: 8px 0 0;
                                            color: #9ca3af;
                                            font-size: 12px;
                                        ">
                                            © 2026 Food Delivery System
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>
                </table>

            </body>
            </html>
        `
    })
}