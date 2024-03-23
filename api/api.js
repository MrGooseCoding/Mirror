const User = require('./../models/user')

function api (url, fun, router, model, tokenRequired = false) {
    router.post(url, async (req, res) => {
        const v = new model.validator(req.body)
    
        await v.format_data()
        const user = new User()
        
        if (tokenRequired) {
            if (!v.not_null("token")) {
                res.status(400).json(v.errors)
                return
            }

            const data = await User.objects_getBy("token", v.data.token)
            if (data["error"]) {
                res.status(400).json(data.json())
                return
            }

            user.setData(data.json())

        }
        await fun(req, res, v, user)
    })
}

module.exports = api