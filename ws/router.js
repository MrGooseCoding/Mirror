const WebSocket = require('ws')
const WrappedWebSocket = require('./websocket')
const urlParamsValidator = require('../validators/urlParamsValidator')
const User = require('../models/user')

class WebSocketRouter {
    constructor () {
        this.handlers = {}
        /**
         * A dictionary that contains functions that validate weather a request is valid to pass it to our websocket
         */
        this.validators = {}
    }

    use (path, router) {
        const relative_paths_handlers = router.getHandlers()
        const relative_paths_validators = router.getValidators()

        const relative_paths_list = Object.keys(relative_paths_handlers) // We are using relative_paths_handlers, but the result is the same with relative_paths_validators

        relative_paths_list.forEach(relative_path => {
            const handler = relative_paths_handlers[relative_path]
            const validator = relative_paths_validators[relative_path]

            this.handlers[path + relative_path] = handler
            this.validators[path + relative_path] = validator
        })
    }

    getHandlers () {
        return this.handlers
    }
    
    getValidators () {
        return this.validators
    }
    
    getHandler (pathname) {
        const handler = this.handlers[pathname]
        if (!handler) {
            return { error: "No handler found" }
        }
        return handler
    }
    
    getValidator (pathname) {
        const formatted_pathname = pathname.endsWith('/') ? pathname : `${pathname}/`
        const validator = this.validators[formatted_pathname]
        if (!validator) {
            return () => {}
        }
        return validator
    }

    /**
     * 
     * @param {String} path 
     * @param {function} handler 
     * @param {Object} validatorOptions Contains some settings to adjust this ws's validator function
     * Some options may be:
     * ```json
     * {
     *     "auth": false, # Weather to authenticate the user
     *     "required_parameters": [] # List of strings containing the required get parameters
     *     "model_parameters": [
     *          {
     *              "param_name": "",
     *              "database_name": "",
     *              "model": Model
     *          }
     *     ]
     *     "inner_logic_validation": async () => {} # A function that contains more advanced logic. Returns a string with the error. It will be executed in the wrappedHandler function
     * }
     * ```
     */
    ws (path, handler, validatorOptions) {
        const { required_parameters, model_parameters, auth, inner_logic_validation } = validatorOptions
        
        const handlerValidator = async (url, socket) => {
            const validator = new urlParamsValidator(url)
            await validator.format_data()

            
            const all_required_parameters = validator.check_required_parameters(required_parameters)            
            
            var model_parameters_valid = true
            for await (let i of model_parameters) {
                const valid = await validator.model_exists(i.param_name, i.database_name, i.model)
                if (!valid) {
                    model_parameters_valid = false
                    break
                }
            }
            
            if (!all_required_parameters || !model_parameters_valid) {
                socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
                socket.destroy()
                return false
            }
            
            if (auth) {
                const token_valid = await validator.token_valid()
                
                if (!token_valid) {
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy()
                    return false
                }
            }
            
            return true
        }

        /**
         * This function is meant to retrieve data from the database and give it as a model to the final ws function. It also performs more detailed and logical validation that cannot be automated (Like comparing two results, for instance)
        */
        const wrappedHandler = async (url, ws, wss) => {
            const validator = new urlParamsValidator(url)
            await validator.format_data()
            
            const url_params = validator.data
            
            var user;
            if (auth) {
                user = await User.objects_getBy("token", validator.data.token)
            } else {
                user = undefined
            }
            
            var model_params = {}
            
            for await (let i of model_parameters) {
                const model = i.model
                const model_name = model.name.toLowerCase()
                const attrName = i.database_name
                const attrValue = validator.data[i.param_name]
                const model_obj = await model.objects_getBy(attrName, attrValue)
                model_params[model_name] = model_obj
            }

            const error = await inner_logic_validation(user, model_params, url_params)

            if (error) {
                ws.send(JSON.stringify({ type: "error", error}))
                ws.close()
                return
            }

            const wrappedWs = new WrappedWebSocket(ws, wss)

            await handler(wrappedWs, user, model_params, url_params)
        }
        
        this.handlers[path] = wrappedHandler
        this.validators[path] = handlerValidator
    }
}

module.exports = WebSocketRouter