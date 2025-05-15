const config = {
    dbPath: 'database.db',
    appName: 'Mirror',
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
    },

    // The list of games allowed. You may remove or add games here
    games: [
        "impostor",
        "hows_yours",
    ],

    games_config: {
        "impostor": {
            "players": {
                "from" : 2,
                "to" : 10
            },
            "description" : "Impostor is a game of improvisation and deduction. Among all players, an impostor is secretly picked, while the rest remain crew members. All crew members are given the same random word. For turns, each player says a word relative to the word given. The impostor doesn't know the given word, so he has to improvise one based on the crewmembers responses. The game ends guessing who the impostor was, winning the crew members if done correctly.",
            "topics": [
                "hospitals",
                "yellow stuff",
            ]
            //"impostor_count"
        },
        "hows_yours": {
            "players": {
                "from" : 2,
                "to" : 10
            },
            "description" : "Among all players, a guesser is picked, while the rest remain crew members. All crew members are given the same random item. For turns, each player says a cuality of their item. The guesser doesn't know the given word, so he has to guess at the end of the game which item they're all talking about. The game ends guessing what the item was.",
            "topics": [
                "phone",
                "shoe"
            ]
            //"impostor_count"
        }
    }
}

module.exports = config
