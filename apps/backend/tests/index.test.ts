import axios from "axios"
import {test, expect} from "bun:test"

const BACKEND_URL = "http://localhost:3001"

const EMAIL = `ankit${Math.random()}@gmail.com`

test("Signup shouldn't work if email is missing", async () => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        password: "sufgeumjgsfrg"
    })
    expect.fail()
    } catch (e) {
        expect(e.status).toBe(400)
    }
})

test("Signup shouldn't work if password is missing", async () => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        email: "sufgeumjgsfrg@gmail.com"
    })
    expect.fail()
    } catch (e) {
        expect(e.status).toBe(400)
    }
})

test("Signup shouldn't work if email isn't valid", async () => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        email: "sufgeumjgsfrfg",
        password: "ksfhrgjbwkguherg"
    })
    expect.fail()
    } catch (e) {
        expect(e.status).toBe(400)
    }
})

test("Signup shouldn't work if email is repeated", async () => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            email: "sufgeumjgsfrg@gmail.com",
            password: "shferijgneiug"
        })
        expect.fail()
    } catch (e) {
        expect(e.status).toBe(400)
    }
})

test("Signup should work if both email and password are provided", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        email: EMAIL,
        password: "shferijgneiug"
    })
    expect(response.status).toBe(201)
    expect(response.data.message).toBe("user created successfully")
})