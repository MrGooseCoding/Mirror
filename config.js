const config = {
    dbPath: 'database.db',
    appName: 'NodeAuth',
    port: 3000,

    validate_email: false, // Validate email address during registration and login
    validation_email: {
        subject: `Email Validation at %s`,
        text: `Hi %s,
Thank you for registering on our website. To validate your email, please introduce the following validation code:

%s

If you didn't register on our website, please ignore this email.

Thanks,
%s Team`
    }
}

module.exports = config