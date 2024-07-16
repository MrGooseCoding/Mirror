const { generate_random_integer } = require('./generators')

function count_votes (votes) {
    const votes_keys = Object.keys(votes)
    const random_integer = generate_random_integer(0, votes_keys.length)
    const random_key = votes_keys[random_integer]

    var most_voted = votes[random_key]
    var votes_by_game = {}
    for (let i of Object.keys(votes)) {
        const game = votes[i]
        votes_by_game[game] = !votes_by_game[game] ? 1 : votes_by_game[game] + 1
        
        if (votes_by_game[game] >= votes_by_game[most_voted]) {
            most_voted = game
        }
    }
    return {votes_by_game, most_voted}
}

module.exports =  { count_votes }