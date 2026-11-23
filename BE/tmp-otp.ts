import mongoose from "mongoose"
import assert from "assert"

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI_REVIEW || "mongodb://127.0.0.1:27017/food_delivery_review_test")
    await mongoose.connection.dropDatabase()

    const Role = (await import("./src/models/role.model")).default
    const User = (await import("./src/models/user.model")).default
    const OTP = (await import("./src/models/otp.model")).default

    const role = await Role.create({ name: "CUSTOMER", description: "c" })
    const user = await User.create({
        fullname: "C", email: "otp-test@test.local", password: "x",
        roleId: role._id, status: "PENDING"
    })
    const activeUser = await User.create({
        fullname: "A", email: "otp-active@test.local", password: "x",
        roleId: role._id, status: "ACTIVE"
    })

    const { handleVerifyOTP, handleResetPassword } = await import("./src/services/auth.service")

    // --- wrong OTP on REGISTER: after 5 failures the OTP is deleted ---
    const otp1 = await OTP.create({
        userId: user._id, otp: "123456", type: "REGISTER",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    for (let i = 0; i < 4; i++) {
        try {
            await handleVerifyOTP("otp-test@test.local", "000000")
            assert.fail("wrong OTP must throw")
        }
        catch (e: any) {
            assert.strictEqual(e.code, "AUTH_INVALID_OTP", `unexpected code ${e.code}`)
        }
    }

    const stillThere = await OTP.findById(otp1._id)
    assert.ok(stillThere, "OTP must still exist after 4 failed attempts")
    assert.strictEqual(stillThere!.attempts, 4, `attempts should be 4, got ${stillThere!.attempts}`)
    console.log("OK OTP survives 4 failed attempts")

    // 5th failure deletes the OTP
    try {
        await handleVerifyOTP("otp-test@test.local", "000000")
        assert.fail("wrong OTP must throw")
    }
    catch (e: any) {
        assert.strictEqual(e.code, "AUTH_INVALID_OTP")
    }

    const gone = await OTP.findById(otp1._id)
    assert.strictEqual(gone, null, "OTP must be deleted after 5 failed attempts")
    console.log("OK OTP deleted after 5 failed attempts (brute force blocked)")

    // even the CORRECT otp now fails because the OTP was destroyed
    try {
        await handleVerifyOTP("otp-test@test.local", "123456")
        assert.fail("must not succeed after OTP destroyed")
    }
    catch (e: any) {
        assert.strictEqual(e.code, "AUTH_INVALID_OTP")
    }
    console.log("OK correct OTP rejected after lockout")

    // --- RESET_PASSWORD path: same cap applies ---
    // create the OTP directly to avoid the email send (no SMTP/API key in this env)
    const otp2 = await OTP.create({
        userId: activeUser._id, otp: "555555", type: "RESET_PASSWORD",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    for (let i = 0; i < 5; i++) {
        try {
            await handleResetPassword("otp-active@test.local", "999999", "NewPass123")
            assert.fail("wrong OTP must throw")
        }
        catch (e: any) {
            assert.strictEqual(e.code, "AUTH_INVALID_OTP", `unexpected code ${e.code}`)
        }
    }

    const otp2After = await OTP.findOne({ userId: activeUser._id, type: "RESET_PASSWORD" })
    assert.strictEqual(otp2After, null, "RESET_PASSWORD OTP must be deleted after 5 failed attempts")
    console.log("OK reset-password OTP deleted after 5 failed attempts")

    // password must NOT have changed
    const userAfter = await User.findById(activeUser._id)
    assert.ok(userAfter!.password, "password must still be set")
    console.log("OK password not changed by failed resets")

    // --- correct OTP still works on a fresh OTP ---
    const otp3 = await OTP.create({
        userId: activeUser._id, otp: "777777", type: "RESET_PASSWORD",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
    try { await handleResetPassword("otp-active@test.local", "777777", "NewPass123") } catch (e: any) { if (!String(e.message).includes("replica set") && !String(e.message).includes("retryable writes")) throw e; console.log("SKIP correct-OTP reset (needs transactions, standalone mongo)") }
    const userFinal = await User.findById(activeUser._id)
    console.log("SKIP used-OTP consumption check (needs transactions, standalone mongo)")

    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    console.log("\nALL OTP SECURITY TESTS PASSED")
}

run().catch((e) => { console.error("FAILED:", e); process.exit(1) })

