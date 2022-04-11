const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser')
const { User } = require("./models/User")
const config = require("./config/key")
const cookieParser = require("cookie-parser")


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extend: true}));

//application/json
app.use(bodyParser.json());

//cookie
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI)
    .then(() => console.log("Mongo DB connected"))
    .catch(err => console.log(err))

// test
app.get('/', (req, res) => {
    res.send('Hello World !')
})

// register
app.post('/api/users/register', (req, res) => {

    const user = new User(req.body);

    user.save((err, user) => {
        if (err) return res.json({ success: false, err})
        return res.status(200).json({ success: true })
    })
})

//login
app.post('/api/users/login',(req,res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "Invalid email address."
            })
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    loginSuccess: false,
                    message: "Invalid password."
                })

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    userId: user._id
                })
            })
        })
    })
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
