import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authRoutes from './routers/auth.js'
import usersRoutes from './routers/users.js'
import mongoose from 'mongoose'
import productRoutes from './routers/products.js'
import adminRoutes from './routers/admin.js'
import orderRoutes from './routers/order.js'

const app = express()
const PORT = 5000

console.log("MONGODBURI==>", process.env.MONGODBURI)
app.use(cors())
app.use(express.json())
app.use(morgan("tiny"));
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/users', usersRoutes)

mongoose.connect(process.env.MONGODBURI).then(() => console.log("mongodb connected"))
    .catch((e) => console.log("error==>", e))


app.get("/", (req, res) => {
    res.send("Hello Backend")
})


app.listen(PORT, () => console.log("Server Is Running PORT" + PORT))