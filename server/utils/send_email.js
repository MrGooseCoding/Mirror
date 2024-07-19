const private_config = require('./../private-config.js')
const nodemailer = require('nodemailer')

async function send_email(opts, callback) { // contains properties from, to, subject and text
    try {
        let transporterParams = {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: private_config.EMAIL,
                pass: private_config.PASSWORD,
                clientId: private_config.CLIENT_ID,
                clientSecret: private_config.CLIENT_SECRET,
                refreshToken: private_config.REFRESH_TOKEN
            }
        }
        let transporter = nodemailer.createTransport(transporterParams)
        opts.from = private_config.EMAIL
        transporter.sendMail(opts, callback)
    }catch (e){
        console.log(e)
    }
}

module.exports = send_email